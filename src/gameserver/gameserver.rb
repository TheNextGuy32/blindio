require 'sinatra'
require 'sinatra-websocket'

require './messageMap.rb'
require './rooms.rb'

class GameServer
 
  def initialize
    @rooms = []
    @connectedPlayers = {}
    initResponses()
  end

  def deletePlayer(ws)
    @connectedPlayers.delete(ws)
    puts "Deleting the player didn't work." if @connectedPlayers.key?(ws)
  end

  def addPlayer(ws)
    @connectedPlayers[ws] = Player.new(ws)

    puts "Now managing player #{ ws } named #{ @connectedPlayers[ws].name }"
    @connectedPlayers[ws]
  end

  def getPlayer(ws)
    @connectedPlayers[ws]
  end
end