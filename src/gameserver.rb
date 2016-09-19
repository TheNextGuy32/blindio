class GameServer
 
  def initialize
    @rooms = []
    @connectedPlayers = {}
  end

  def deletePlayer(ws)
    @connectedPlayers.delete(ws)
    puts "Deleting the player didn't work." if @connectedPlayers.key?(ws)
  end

  def addPlayer(player)
    @connectedPlayers[player.ws] = player
    puts "Now managing player named #{ player.name }"
  end

  def joinRandomRoom(player)
    getOpenRoom.addPlayer(player)
  end

  # Returns a room wiht an open spot in it, creates a new one if all are full
  def getOpenRoom
    for room in @rooms
      if room.players.length < room.maxOccupancy
        return room
      end 
    end

    room = Room.new
    @rooms.push(room)
    room
  end

  def pollRooms
    message = "#{ @connectedPlayers.length } players --- "
    
    for room in @rooms
      message << room.getStatus << " "
    end
    message
  end

  
end