require 'sinatra'

class Pumatra < Sinatra::Base
  get '/' do
    return 'It works!'
  end
end

if __FILE__ == $0
  Pumatra.run!
end
Raw