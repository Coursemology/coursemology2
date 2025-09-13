# frozen_string_literal: true
json.array! plagiarism_checks do |plagiarism_check|
  json.partial! 'plagiarism_check', locals: { plagiarism_check: plagiarism_check }
end
