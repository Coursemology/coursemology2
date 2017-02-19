json.(response, :id, :submitted_at)
json.answers do
  json.array! response.answers, partial: 'answer', as: :answer
end
