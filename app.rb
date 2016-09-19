require 'sinatra'
require 'sinatra-websocket'
require './src/gameserver.rb'
require './src/player.rb'

set :gameServer, GameServer.new

def connectPlayer(ws)
  ws.send("You've connected to the Blind.io websocket server!")

  player = Player.new(ws)
  settings.gameServer.addPlayer(player)

  ws.send("You've been named #{ player.name }.")
end

def disconnectPlayer(ws)
  settings.gameServer.deletePlayer(ws)
end

get '/' do
  if !request.websocket?
    File.read(File.join('public', 'index.html'))
  else
    request.websocket do |ws|
     
      ws.onopen do connectPlayer(ws) end
      ws.onclose do disconnectPlayer(ws) end
      
      ws.onmessage do |msg|
        EM.next_tick { settings.sockets.each{|s| s.send(msg) } }
      end
    end
  end
end

