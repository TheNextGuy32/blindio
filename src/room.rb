require 'faker'

class Room

  def init
    @name = "#{ Faker::Color.color_name.capitalize
    } #{ Faker::Hacker.adjective.capitalize } #{ Faker::Hipster.word.capitalize }"
    @players = []
    @maxOccupancy = 8
  end

  def addPlayer(player)
    puts "Added #{ player.name } to room named #{ room.name }."

    room.players << player
    player.room = room
    
    puts room.getStatus

    room
  end

  def removePlayer(player)
    if player.key?(:room)
      room = player.room
      room.players.delete(player)

      puts "Removed #{ player.name } from room named #{ room.name }."    
      puts room.getStatus

      if room.players.length == 0
        @rooms.delete(room)
        puts "Deleted room named #{ room.name }"
      end
    end
  end

  def getStatus
    "#{ @name }:#{ @players.length }/#{ @maxOccupancy }"
  end

end