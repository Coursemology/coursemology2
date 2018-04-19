# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Homepage' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course, :enrollable) }
    let(:feed_notifications) do
      notifications = []
      # Achievement gained notification
      achievement = create(:course_achievement, course: course)
      achievement_activity = create(:activity, :achievement_gained, object: achievement)
      notifications << create(:course_notification, :feed,
                              activity: achievement_activity,
                              course: course)

      # Assessment attempted notification
      assessment = create(:assessment, course: course)
      assessment_activity = create(:activity, :assessment_attempted, object: assessment)
      notifications << create(:course_notification, :feed,
                              activity: assessment_activity,
                              course: course)

      # Level reached notification
      level = create(:course_level, course: course)
      level_activity = create(:activity, :level_reached, object: level)
      notifications << create(:course_notification, :feed,
                              activity: level_activity,
                              course: course)

      # Forum topic created notification
      forum = create(:forum, course: course)
      topic = create(:forum_topic, forum: forum)
      topic_activity = create(:activity, :forum_topic_created, object: topic)
      notifications << create(:course_notification, :feed,
                              activity: topic_activity,
                              course: course)

      # Forum post replied notification
      post = create(:course_discussion_post, topic: topic.acting_as)
      post_replied_activity = create(:activity, :forum_post_replied, object: post)
      notifications << create(:course_notification, :feed,
                              activity: post_replied_activity,
                              course: course)

      # Video attempted notification
      video = create(:video, course: course)
      video_activity = create(:activity, :video_attempted, object: video)
      notifications << create(:course_notification, :feed,
                              activity: video_activity,
                              course: course)

      notifications
    end

    let(:assessment_todos) do
      todos = {}

      assessment = create(:assessment, :published_with_mrq_question, course: course)
      todos[:not_started] =
        Course::LessonPlan::Todo.find_by(user: user, item: assessment.lesson_plan_item)

      assessment = create(:assessment, :published_with_mrq_question, course: course)
      create(:submission, :attempting, assessment: assessment, creator: user)
      todos[:in_progress] =
        Course::LessonPlan::Todo.find_by(user: user, item: assessment.lesson_plan_item)

      assessment = create(:assessment, :published_with_mrq_question, course: course)
      create(:submission, :submitted, assessment: assessment, creator: user)
      todos[:completed] =
        Course::LessonPlan::Todo.find_by(user: user, item: assessment.lesson_plan_item)

      assessment = create(:assessment, :with_mrq_question, published: false, course: course)
      create(:submission, :submitted, assessment: assessment, creator: user)
      todos[:unpublished] =
        Course::LessonPlan::Todo.find_by(user: user, item: assessment.lesson_plan_item)

      assessment = create(:assessment, :published_with_mrq_question, :view_password, course: course)
      todos[:enter_password] =
        Course::LessonPlan::Todo.find_by(user: user, item: assessment.lesson_plan_item)

      todos
    end

    let(:video_todo) do
      video = create(:video, :published, course: course)
      Course::LessonPlan::Todo.find_by(user: user, item: video.lesson_plan_item)
    end

    let(:survey_todo) do
      survey = create(:survey, :published, :currently_active,
                      section_traits: :with_mrq_question, course: course)
      Course::LessonPlan::Todo.find_by(user: user, item: survey.lesson_plan_item)
    end

    before do
      login_as(user, scope: :user)
    end

    context 'As a user registered for the course' do
      let(:course_user) { create(:course_student, course: course) }
      let(:user) { course_user.user }

      scenario 'I can visit the course homepage' do
        visit course_path(course)

        expect(course_user.reload.last_active_at).to be_within(1.hour).of(Time.zone.now)
      end

      scenario 'I am able to see announcements in course homepage' do
        valid_announcement = create(:course_announcement, course: course)
        visit course_path(course)
        expect(page).to have_content_tag_for(valid_announcement)
      end

      scenario 'I am able to see the activity feed in course homepage' do
        feed_notifications

        visit course_path(course)
        feed_notifications.each do |notification|
          expect(page).to have_content_tag_for(notification)
        end
      end

      scenario 'I am unable to see activities with deleted objects in my course homepage' do
        feed_notifications.each do |notification|
          notification.activity.object.delete
        end

        visit course_path(course)
        feed_notifications.each do |notification|
          expect(page).to have_no_content_tag_for(notification)
        end
      end

      scenario 'I can view and ignore the relevant todos in my homepage', js: true do
        assessment_todos
        video_todo
        survey_todo
        visit course_path(course)

        within find(content_tag_selector(assessment_todos[:enter_password])) do
          expect(page).to have_text(
            I18n.t('course.assessment.assessments.todo_assessment_button.enter_password')
          )
        end

        [:completed, :unpublished].each do |status|
          expect(page).to have_no_content_tag_for(assessment_todos[status])
        end

        within find(content_tag_selector(assessment_todos[:not_started])) do
          expect(page).to have_text(
            I18n.t('course.assessment.assessments.todo_assessment_button.attempt')
          )
        end

        within find(content_tag_selector(assessment_todos[:in_progress])) do
          expect(page).to have_text(
            I18n.t('course.assessment.assessments.todo_assessment_button.resume')
          )

          # click_button is not used because poltergist detected overlapping elements with the
          #   navbar. See poltergeist#520 for more details.
          find('input.btn.btn-primary').click
          wait_for_ajax
          expect(assessment_todos[:in_progress].reload.ignore?).to be_truthy
        end

        # Reload page to load other todos
        visit course_path(course)
        within find(content_tag_selector(video_todo)) do
          expect(page).to have_text(I18n.t('course.video.videos.video_attempt_button.watch'))
        end

        within find(content_tag_selector(survey_todo)) do
          expect(page).to have_text(I18n.t('course.surveys.todo_survey_button.respond'))
        end
      end
    end

    context 'As a user not registered for the course' do
      let(:user) { create(:user) }
      scenario 'I am not able to see announcements in course homepage' do
        valid_announcement = create(:course_announcement, course: course)
        visit course_path(course)
        expect(page).to have_no_content_tag_for(valid_announcement)
      end

      scenario 'I am not able to see the activity feed in course homepage' do
        feed_notifications

        visit course_path(course)
        feed_notifications.each do |notification|
          expect(page).to have_no_content_tag_for(notification)
        end
      end

      scenario 'I am able to see owner and managers in instructors list' do
        manager = create(:course_manager, course: course)
        teaching_assistant = create(:course_teaching_assistant, course: course)
        visit course_path(course)
        course.course_users.owner.each do |course_user|
          expect(page).to have_selector('span.name', text: course_user.name)
        end
        expect(page).to have_selector('span.name', text: manager.name)
        expect(page).not_to have_selector('span.name', text: teaching_assistant.name)
      end

      scenario 'I am able to see the course description' do
        visit course_path(course)
        expect(page).to have_selector('h2', text: I18n.t('course.courses.show.description'))
        expect(page).to have_text(course.description)
      end
    end
  end
end
