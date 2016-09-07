require 'sinatra'
require 'sinatra-websocket'
require './src/gameserver.rb'

set :sockets, []
set :gameServer, GameServer.new
get '/' do
  if !request.websocket?
    File.read(File.join('public', 'index.html'))
  else
    request.websocket do |ws|
     
     ws.onopen do
        puts "Websocket connected."
        ws.send("You've connected to the Blind.io websocket server!")
        settings.sockets << ws

        player = settings.gameServer.createPlayer
        room = settings.gameServer.getOpenRoom
        settings.gameServer.addPlayerToRoom(player,room)
        ws.send("You've been named #{player[:name]} and you've placed in a room named #{room[:name]}")
      end

      ws.onmessage do |msg|
        EM.next_tick { settings.sockets.each{|s| s.send(msg) } }
      end

      ws.onclose do
        warn("Websocket closed")
        settings.sockets.delete(ws)
      end

    end

  end
end