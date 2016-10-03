require 'faker'

class Player
	
  attr_accessor :name, :ws

  def initialize (websocket)
    @name = Faker::Name.first_name
    @ws = websocket
  end

  def getStatus
    "#{ @ws }:#{ @name }"
  end
end