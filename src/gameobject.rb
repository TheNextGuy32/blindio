class GameObject 
	
  attr_accessor :x, :y, :vx, :vy

  def initialize (x, y)
    @x = x
    @y = y
    @vx = 0
    @vy = 0
  end
  
  def update(dt)
  	@x = @x + (@vx * dt)
  	@y = @y + (@vy * dt)
  end
end