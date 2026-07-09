# frozen_string_literal: true
json.canAccess true
json.listings @listings do |listing|
  assessment = listing.assessment
  json.id listing.id
  json.assessmentId assessment.id
  json.title assessment.title
  json.questionCount(@question_counts[assessment.id] || 0)
  json.adoptions(@adoption_counts[listing.id] || 0)
  json.firstPublishedAt listing.first_published_at
  json.previewUrl course_listing_path(current_course, listing)
  json.duplicateUrl duplicate_course_listings_path(current_course)
end
json.destinationTabs @destination_tabs do |tab|
  json.id tab[:id]
  json.title tab[:title]
  json.categoryId tab[:category_id]
  json.categoryTitle tab[:category_title]
end
