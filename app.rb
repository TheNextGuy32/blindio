require 'sinatra'
require 'sinatra-websocket'
require './src/gameserver/gameserver.rb'
require './src/player.rb'
require 'json'

set :gameServer, GameServer.new

def connectPlayer(ws)
  player = settings.gameServer.addPlayer(ws)
  ws.send({type: "connected", data: "You've connected to the Blind.io websocket server!\nYou've been named #{ player.name }."}.to_json)
end

def disconnectPlayer(ws)
  settings.gameServer.deletePlayer(ws)
end

def onMessage(ws,msg)
  settings.gameServer.processMessage(ws,msg)
end

get '/' do
  if !request.websocket?
    File.read(File.join('public', 'index.html'))
  else
    request.websocket do |ws|
      ws.onopen do connectPlayer(ws) end
      ws.onclose do disconnectPlayer(ws) end
      ws.onmessage do |msg| onMessage(ws,msg) end
    end
  end
end

