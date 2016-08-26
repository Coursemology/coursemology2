# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Forum: Search' do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:forum_topic) { create(:forum_topic, course: course) }
    let(:student) { create(:course_student, course: course) }
    let(:course_teaching_assistant) { create(:course_teaching_assistant, course: course) }

    before { login_as(user, scope: :user) }

    context 'As a Course Teaching Assistant' do
      let(:user) { course_teaching_assistant.user }
      let!(:posts) do
        create_list(:course_discussion_post, 3,
                    topic: forum_topic.acting_as,
                    creator: student.user, updater: student.user,
                    created_at: 2.weeks.ago, updated_at: 2.weeks.ago)
      end

      scenario 'I can search for posts made by a course user' do
        visit search_course_forums_path(course)

        within find('.search-panel') do
          fill_in 'search[start_time]', with: 3.weeks.ago
          fill_in 'search[end_time]', with: 1.week.ago
          select student.name
          click_button I18n.t('course.forum.forums.search.search')
        end

        posts.each do |post|
          expect(page).to have_content_tag_for(post)
        end
      end
    end
  end
end
