require "json"

class GameServer

  def initResponses 
    @responses = {
      "askRoom" => 
    }
  end

  def askRoom(ws, msg)
    room = getOpenRoom
    room.addPlayer(@connectedPlayers[ws])
    response = {
      :type => "room",
    }

    return 
  end

  def processMessage(ws, msg)
    puts "Received message from #{ @connectedPlayers[ws].name }: #{msg}"
    data = JSON.parse(msg)
    @resposes[data.type](ws,msg);
  end
end


#  Send to all connected to server
  # def broadcastToAll

  # end
  # #  Send to all connect to server but ws
  # def emitToAll(ws)
    
  # end
  # #  Send to all in room
  # def broadcastToRoom(room)

  # end
  # #  Send to all in room but ws
  # def emitToRoom(room,ws)

  # end