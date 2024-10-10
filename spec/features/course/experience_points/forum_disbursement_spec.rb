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

    context 'As a Course Teaching Assistant', js: true do
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
        visit course_experience_points_records_path(course)
        find('button', text: 'Forum Participation Disbursement').click

        within find(content_tag_selector(students[0])) do
          expect(page).to have_field(type: 'text', with: '100')
        end

        start_date = (4.weeks.ago + 1.minute).strftime('%d-%m-%Y %I:%M')
        end_date = 2.weeks.ago.strftime('%d-%m-%Y %I:%M')

        fill_in_mui_datetime('Start Date', start_date)
        fill_in_mui_datetime('End Date', end_date)
        find_field('Weekly Cap').click.set(200)

        within find('.forum-participation-search-panel') do
          find('button.filter-btn-submit').click
        end

        # The first student gets 400 (2 * weekly_cap) for the 2-week span since his
        # participation score is higher than the rest due to the additional upvote.
        within find(content_tag_selector(students[0])) do
          expect(page).to have_field(type: 'text', with: '400')
        end
        # The other two students get the same experience points because they have the
        # same participation score.
        within find(content_tag_selector(students[1])) do
          expect(page).to have_field(type: 'text', with: '200')
        end
        within find(content_tag_selector(students[2])) do
          expect(page).to have_field(type: 'text', with: '200')
        end

        expect do
          find('button.forum-btn-submit').click
          expect_toastify("Experience points disbursed to #{students.count} recipients.")
        end.to change(Course::ExperiencePointsRecord, :count).by(students.count)
      end
    end
  end
end
