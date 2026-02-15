# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Homepage', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course, :published, :enrollable) }
    let(:course_user) { create(:course_student, course: course) }
    let(:registered_user) { course_user.user }
    let(:feed_notifications) do
      notifications = []
      # Achievement gained notification
      achievement = create(:course_achievement, course: course)
      achievement_activity = create(:activity, :achievement_gained, actor: registered_user, object: achievement)
      notifications << create(:course_notification, :feed,
                              activity: achievement_activity,
                              course: course)

      # Assessment attempted notification
      assessment = create(:assessment, course: course)
      assessment_activity = create(:activity, :assessment_attempted, actor: registered_user, object: assessment)
      notifications << create(:course_notification, :feed,
                              activity: assessment_activity,
                              course: course)

      # Level reached notification
      level = create(:course_level, course: course)
      level_activity = create(:activity, :level_reached, actor: registered_user, object: level)
      notifications << create(:course_notification, :feed,
                              activity: level_activity,
                              course: course)

      # Forum topic created notification
      forum = create(:forum, course: course)
      topic = create(:forum_topic, forum: forum)
      topic_activity = create(:activity, :forum_topic_created, actor: registered_user, object: topic)
      notifications << create(:course_notification, :feed,
                              activity: topic_activity,
                              course: course)

      # Forum post replied notification
      post = create(:course_discussion_post, topic: topic.acting_as)
      post_replied_activity = create(:activity, :forum_post_replied, actor: registered_user, object: post)
      notifications << create(:course_notification, :feed,
                              activity: post_replied_activity,
                              course: course)

      # Video attempted notification
      video = create(:video, course: course)
      video_activity = create(:activity, :video_attempted, actor: registered_user, object: video)
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
      let(:user) { registered_user }

      scenario 'I can visit the course homepage' do
        visit course_path(course)

        # we have at least one FE assertion to ensure below check is performed after record is updated
        expect(page).to have_text(course.title)
        expect(course_user.reload.last_active_at).to be_within(1.hour).of(Time.zone.now)
      end

      scenario 'I am able to see announcements in course homepage' do
        valid_announcement = create(:course_announcement, course: course)
        visit course_path(course)
        expect(page).to have_selector("#announcement-#{valid_announcement.id}")
      end

      scenario 'I am able to see the activity feed in course homepage' do
        feed_notifications

        visit course_path(course)
        feed_notifications.each do |notification|
          expect(page).to have_selector("#notification-#{notification.id}")
        end
      end

      scenario 'I am unable to see activities with deleted objects in my course homepage' do
        feed_notifications.each do |notification|
          notification.activity.object.delete
        end

        visit course_path(course)
        feed_notifications.each do |notification|
          expect(page).to_not have_selector("#notification-#{notification.id}")
        end
      end

      scenario 'I can view and ignore the relevant todos in my homepage' do
        assessment_todos
        video_todo
        survey_todo
        visit course_path(course)

        within find("#todo-#{assessment_todos[:enter_password].id}") do
          expect(page).to have_text('Unlock')
        end

        [:completed, :unpublished].each do |status|
          expect(page).to_not have_selector("#todo-#{assessment_todos[status].id}")
        end

        within find("#todo-#{assessment_todos[:not_started].id}") do
          expect(page).to have_text('Attempt')
        end

        within find("#todo-#{assessment_todos[:in_progress].id}") do
          expect(page).to have_text('Resume')
        end

        find("#todo-ignore-button-#{assessment_todos[:in_progress].id}").click
        expect_toastify 'Pending task successfully ignored'

        # Reload page to load other todos
        visit course_path(course)
        within find("#todo-#{video_todo.id}") do
          expect(page).to have_text('Watch')
        end

        within find("#todo-#{survey_todo.id}") do
          expect(page).to have_text('Respond')
        end
      end
    end

    context 'As a user not registered for the course' do
      let(:user) { create(:user) }
      scenario 'I am not able to see announcements in course homepage' do
        valid_announcement = create(:course_announcement, course: course)
        visit course_path(course)
        expect(page).to_not have_selector("#announcement-#{valid_announcement.id}")
      end

      scenario 'I am not able to see the activity feed in course homepage' do
        feed_notifications

        visit course_path(course)
        feed_notifications.each do |notification|
          expect(page).to_not have_selector("#notification-#{notification.id}")
        end
      end

      scenario 'I am able to see owner and managers in instructors list' do
        manager = create(:course_manager, course: course)
        teaching_assistant = create(:course_teaching_assistant, course: course)
        visit course_path(course)
        course.course_users.owner.each do |course_user|
          expect(page).to have_selector("#instructor-#{course_user.user_id}")
        end
        expect(page).to have_selector("#instructor-#{manager.user_id}")
        expect(page).not_to have_selector("#instructor-#{teaching_assistant.user_id}")
      end

      scenario 'I am able to see the course description' do
        visit course_path(course)
        expect(page).to have_text('Description')
        expect(page).to have_text(course.description)
      end
    end
  end
end
