require 'faker'

class GameServer
  def initialize
    @rooms = []
    @connectedPlayers = {}

    @logActivity = true
  end

  def createPlayer(ws)
    
    player = {
      :name => Faker::Name.first_name,
      :ws => ws
    }
    @connectedPlayers[ws] = player
  end

  def deletePlayer(ws)
    player = @connectedPlayers[ws]
    removePlayerFromRoom(player)

    @connectedPlayers.delete(ws)
    puts "it didn't work" if @connectedPlayers.key?(ws)
  end

  def createRoom
    room = {
      :name => "#{Faker::Color.color_name.capitalize} #{Faker::Hacker.adjective.capitalize} #{Faker::Hipster.word.capitalize}",
      :players => [],
      :maxOccupancy => 8
    }
    puts "Created room named #{room[:name]}." if @logActivity
    @rooms << room
    room
  end

  def joinRandomRoom(player)
    addPlayerToRoom(player,getOpenRoom)
  end

  # Returns a room wiht an open spot in it, creates a new one if all are full
  def getOpenRoom
    for room in @rooms
      if room[:players].length < room[:maxOccupancy]
        return room
      end 
    end

    createRoom
  end

  def addPlayerToRoom(player, room)
    puts "Added #{player[:name]} to room named #{room[:name]}." if @logActivity

    room[:players] << player
    player[:room] = room
    
    puts getRoomStatus(room) if @logActivity

    room
  end

  def removePlayerFromRoom(player)
    if player.key?(:room)
      room = player[:room]
      room[:players].delete(player)

      puts "Removed #{player[:name]} from room named #{room[:name]}." if @logActivity    
      puts getRoomStatus(room) if @logActivity

      if room[:players].length == 0
        @rooms.delete(room)
        puts "Deleted room named #{room[:name]}" if @logActivity
      end
    end
  end

  def pollRooms
    message = "#{@connectedPlayers.length} players --- "
    for room in @rooms
      message << getRoomStatus(room) << " "
    end
    message
  end

  def getRoomStatus(room)
    "#{room[:name]}:#{room[:players].length}/#{room[:maxOccupancy]}"
  end
end