class GameServer
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