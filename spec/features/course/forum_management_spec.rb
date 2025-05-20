# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Forum: Management', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }
      scenario 'I can see forums' do
        forums = create_list(:forum, 2, course: course)
        visit course_forums_path(course)
        forums.each do |forum|
          within find("tr.forum_#{forum.id}") do
            expect(page).to have_link(forum.name, href: course_forum_path(course, forum))
            expect(page).to have_selector(".forum-subscribe-#{forum.id}", visible: false)
            expect(page).to have_selector("button.forum-edit-#{forum.id}", visible: false)
            expect(page).to have_selector("button.forum-delete-#{forum.id}", visible: false)
          end
        end
      end

      scenario 'I can create a new forum' do
        forum = build_stubbed(:forum)

        visit course_forums_path(course)

        click_button 'New Forum'
        expect(page).to have_selector('h2', text: 'New Forum')

        # Create a forum with a missing name.
        fill_in_react_ck 'textarea[name=description]', forum.description
        find('button.btn-submit').click
        find_react_hook_form_error

        # Create a forum with a name.
        fill_in 'name', with: forum.name

        expect do
          find('button.btn-submit').click
          expect(page).not_to have_selector('h2', text: 'New Forum')
        end.to change { course.forums.count }.by(1)

        expect_toastify("Forum #{forum.name} has been created.")

        forum_created = course.forums.last
        expect(page).to have_selector("tr.forum_#{forum_created.id}")
      end

      scenario 'I can edit a forum from the forum show page' do
        forum = create(:forum, course: course)

        # Edit with valid information.
        visit course_forum_path(course, forum)
        expect(page).to have_no_selector(".forum-subscribe-#{forum.id}")
        expect(page).to have_selector("button.forum-edit-#{forum.id}")
        expect(page).to have_selector("button.forum-delete-#{forum.id}")
        find("button.forum-edit-#{forum.id}").click

        new_name = 'new name'
        fill_in 'name', with: new_name
        find('.btn-submit').click

        expect_toastify("Forum #{new_name} has been updated.")

        expect(page).to have_text(new_name)

        # Edit with invalid information.
        find("button.forum-edit-#{forum.id}").click

        fill_in 'name', with: ''
        find('.btn-submit').click
        find_react_hook_form_error
      end

      scenario 'I can edit a forum from the forum index page' do
        forum = create(:forum, course: course)

        # Edit with valid information.
        visit course_forums_path(course)
        expect(page).to have_selector("tr.forum_#{forum.id}")
        find("button.forum-action-#{forum.id}").hover
        find("button.forum-edit-#{forum.id}").click

        new_name = 'new name'
        fill_in 'name', with: new_name
        find('.btn-submit').click

        expect_toastify("Forum #{new_name} has been updated.")

        expect(forum.reload.name).to eq(new_name)
        within find("tr.forum_#{forum.id}") do
          expect(page).to have_text(new_name)
        end
        # Edit with invalid information.
        find("button.forum-action-#{forum.id}").hover
        find("button.forum-edit-#{forum.id}").click

        fill_in 'name', with: ''
        find('.btn-submit').click
        find_react_hook_form_error
      end

      scenario 'I can delete a forum from the forum show page' do
        forum = create(:forum, course: course)
        visit course_forum_path(course, forum)

        expect do
          find("button.forum-delete-#{forum.id}").click
          accept_prompt
        end.to change { course.forums.exists?(forum.id) }.to(false)

        expect(page).to have_current_path(course_forums_path(course))
        expect(page).to have_no_selector("tr.forum_#{forum.id}")
      end

      scenario 'I can delete a forum from the forum index page' do
        forum = create(:forum, course: course)
        visit course_forums_path(course)

        expect(page).to have_selector("tr.forum_#{forum.id}")

        expect do
          find("button.forum-action-#{forum.id}").hover
          find("button.forum-delete-#{forum.id}").click
          accept_prompt
        end.to change { course.forums.exists?(forum.id) }.to(false)

        expect(page).to have_no_selector("tr.forum_#{forum.id}")
      end

      scenario 'I can subscribe and unsubscribe to a forum ' do
        forum = create(:forum, course: course)

        # Subscribe and unsubscribe at the course forums page
        visit course_forums_path(course)

        find("button.forum-action-#{forum.id}").hover
        find(".forum-subscribe-#{forum.id}").click
        expect_toastify("You have successfully been subscribed to #{forum.name}.")
        expect(Course::Forum::Subscription.where(user: user, forum: forum).count).to eq(1)

        find("button.forum-action-#{forum.id}").hover
        find(".forum-subscribe-#{forum.id}").click
        expect_toastify("You have successfully been unsubscribed from #{forum.name}.")
        expect(Course::Forum::Subscription.where(user: user, forum: forum).empty?).to eq(true)
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }
      scenario 'I can see forums' do
        forums = create_list(:forum, 2, course: course)
        visit course_forums_path(course)
        forums.each do |forum|
          within find("tr.forum_#{forum.id}") do
            expect(page).to have_link(forum.name, href: course_forum_path(course, forum))
            expect(page).to have_selector(".forum-subscribe-#{forum.id}")
            expect(page).to have_no_selector("button.forum-edit-#{forum.id}")
            expect(page).to have_no_selector("button.forum-delete-#{forum.id}")
          end
        end
      end

      scenario 'I can subscribe and unsubscribe to a forum ' do
        forum = create(:forum, course: course)

        # Subscribe and unsubscribe at the course forums page
        visit course_forums_path(course)
        find(".forum-subscribe-#{forum.id}").click
        expect_toastify("You have successfully been subscribed to #{forum.name}.")
        expect(Course::Forum::Subscription.where(user: user, forum: forum).count).to eq(1)

        find(".forum-subscribe-#{forum.id}").click
        expect_toastify("You have successfully been unsubscribed from #{forum.name}.")
        expect(Course::Forum::Subscription.where(user: user, forum: forum).empty?).to eq(true)
      end

      scenario 'I can click unsubscribe forum link from an email' do
        forum = create(:forum, course: course)
        forum.subscriptions.create(user: user)
        visit course_forum_path(course, forum, subscribe_forum: false)
        expect(page).to have_current_path(course_forum_path(course, forum, { subscribe_forum: false }))
        expect_toastify("You have successfully been unsubscribed from #{forum.name}.")
        expect(Course::Forum::Subscription.where(user: user, forum: forum).empty?).to eq(true)

        # Go to the same link again
        visit course_forum_path(course, forum, subscribe_forum: false)
        expect_toastify("You have successfully been unsubscribed from #{forum.name}.")
      end

      scenario 'I can mark all forum topics in the course as read' do
        forum1 = create(:forum, course: course)
        forum2 = create(:forum, course: course)
        topics = create_list(:forum_topic, 2, forum: forum1) +
                 create_list(:forum_topic, 2, forum: forum2)

        expect(topics.all? { |t| t.unread?(user) }).to be_truthy

        visit course_forums_path(course)
        find('button.mark-all-as-read-button').click
        wait_for_page

        expect(page).to have_current_path(course_forums_path(course))
        expect(topics.all? { |t| t.unread?(user) }).to be_falsy
      end

      scenario 'I can mark topics in the forum as read' do
        forum = create(:forum, course: course)
        topics = create_list(:forum_topic, 2, forum: forum)
        expect(topics.all? { |t| t.unread?(user) }).to be_truthy

        visit course_forum_path(course, forum)
        expect(page).to have_no_selector(".forum-subscribe-#{forum.id}")
        expect(page).to have_no_selector("button.forum-edit-#{forum.id}")
        expect(page).to have_no_selector("button.forum-delete-#{forum.id}")
        find('button.mark-all-as-read-button').click
        wait_for_page

        expect(page).to have_current_path(course_forum_path(course, forum))
        expect(topics.all? { |t| t.unread?(user) }).to be_falsy
      end

      scenario 'I can go to next unread topic' do
        forum = create(:forum, course: course)
        topic = create(:forum_topic, forum: forum)
        visit course_forums_path(course)
        find_link('Next Unread', href: course_forum_topic_path(course, forum, topic)).click

        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))
        expect(page).to have_selector('div', text: topic.title)
      end
    end
  end
end
