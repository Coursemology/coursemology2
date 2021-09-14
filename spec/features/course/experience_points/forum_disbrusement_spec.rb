# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Experience Points: Forum Disbursement' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:forum_topic) { create(:forum_topic, course: course) }
    let(:students) { create_list(:course_student, 3, course: course) }
    let(:course_teaching_assistant) { create(:course_teaching_assistant, course: course) }

    before { login_as(user, scope: :user) }

    context 'As a Course Teaching Assistant' do
      let(:user) { course_teaching_assistant.user }

      scenario 'I can compute and award forum participation points' do
        recent_date = Time.use_zone(Application::Application.config.x.default_user_time_zone) do
          DateTime.current.at_beginning_of_week.end_of_day.in_time_zone - 2.days
        end
        create(:course_discussion_post, topic: forum_topic.acting_as,
                                        creator: students.first.user, updater: students.first.user,
                                        created_at: recent_date, updated_at: recent_date)
        older_posts = students.map do |student|
          create(:course_discussion_post, topic: forum_topic.acting_as,
                                          creator: student.user, updater: student.user,
                                          created_at: 3.weeks.ago, updated_at: 3.weeks.ago)
        end
        create(:course_discussion_post_vote, post: older_posts[0])
        visit forum_disbursement_course_users_path(course)

        within find(content_tag_selector(students[0])) do
          expect(find('.points_awarded').value).to eq('100')
        end

        within find('.forum-participation-search-panel') do
          fill_in 'experience_points_forum_disbursement[start_time]', with: 4.weeks.ago
          fill_in 'experience_points_forum_disbursement[end_time]', with: 2.weeks.ago
          fill_in 'experience_points_forum_disbursement[weekly_cap]', with: 200
          click_button I18n.t('course.experience_points.forum_disbursement.new.search')
        end

        # The first student gets 400 (2 * weekly_cap) for the 2-week span since his
        # participation score is higher than the rest due to the additional upvote.
        within find(content_tag_selector(students[0])) do
          expect(find('.points_awarded').value).to eq('400')
        end
        # The other two students get the same experience points because they have the
        # same participation score.
        within find(content_tag_selector(students[1])) do
          expect(find('.points_awarded').value).to eq('200')
        end
        within find(content_tag_selector(students[2])) do
          expect(find('.points_awarded').value).to eq('200')
          expect(all('td a').last[:href]).to include(search_course_forums_path(course))
        end

        expect { click_button I18n.t('course.experience_points.forum_disbursement.new.submit') }.
          to change { Course::ExperiencePointsRecord.count }.by(3)
      end
    end
  end
end
