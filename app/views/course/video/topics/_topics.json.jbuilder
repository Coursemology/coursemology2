json.topics do
  topics.each do |topic|
    json.set! topic.id do
      json.partial! topic
    end
  end
end
