json.sessions do
  @sessions.each do |session|
    json.set! session.id do
      json.partial! session
    end
  end
end
