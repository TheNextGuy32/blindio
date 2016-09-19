require 'faker'

class Player 
  def init (websocket)
    @name = Faker::Name.first_name
    @ws = websocket
  end

  def getStatus
    "#{ @ws }:#{ @name } in #{@room}"
  end
end