require 'faker'

class GameServer
  def initialize
    @rooms = []
    @logActivity = true
  end

  def createPlayer
    {
      :name => Faker::Name.name
    }
  end

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
    puts getRoomStatus(room) if @logActivity
  end
  def removePlayerFromRoom(player, room)
    puts "Removed #{player[:name]} from room named #{room[:name]}." if @logActivity
    room[:players].delete(player)
    puts getRoomStatus(room) if @logActivity
  end

  def pollRooms
    message = ""
    for room in @rooms
      message << getRoomStatus(room) << " "
    end
    message
  end
  def getRoomStatus(room)
    "#{room[:name]}:#{room[:players].length}/#{room[:maxOccupancy]}"
  end

  def createRoom
    room = {
      :name => Faker::Name.name,
      :players => [],
      :maxOccupancy => 8
    }
    puts "Created room named #{room[:name]}." if @logActivity
    @rooms << room
    room
  end
end