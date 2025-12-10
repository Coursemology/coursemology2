# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Forum: Topic: Management', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:forum) { create(:forum, course: course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }
      scenario 'I can see topics' do
        topics = create_list(:forum_topic, 2, forum: forum)
        hidden_topic = create(:forum_topic, forum: forum, hidden: true)

        visit course_forum_path(course, forum)
        topics.each do |topic|
          within find("tr.topic_#{topic.id}") do
            expect(page).to have_link(topic.title, href: course_forum_topic_path(course, forum, topic))
            expect(page).to have_selector(".topic-subscribe-#{topic.id}")
            find("button.topic-action-#{topic.id}").hover
            expect(page).to have_selector("button.topic-hide-#{topic.id}")
            expect(page).to have_selector("button.topic-lock-#{topic.id}")
            expect(page).to have_selector("button.topic-edit-#{topic.id}")
            expect(page).to have_selector("button.topic-delete-#{topic.id}")
          end
        end

        expect(page).to have_selector("tr.topic_#{hidden_topic.id}")
      end

      scenario 'I can create a new topic with all types' do
        topic = build_stubbed(:forum_topic, forum: forum)

        visit course_forum_path(course, forum)

        click_button 'New Topic'
        expect(page).to have_selector('h2', text: 'New Topic')

        # Create a topic with a missing title.
        fill_in_react_ck 'textarea[name=text]', 'test'
        find('button.btn-submit').click
        find_react_hook_form_error

        # Create an announcement topic with a title.
        fill_in 'title', with: topic.title

        find('#select').click
        find('#select-announcement').click

        find('button.btn-submit').click
        wait_for_page

        expect(forum.topics.last.topic_type).to eq('announcement')
        expect(forum.topics.last.posts.first.text).to eq('<p>test</p>')

        # Create a sticky topic with a title.
        visit course_forum_path(course, forum)
        click_button 'New Topic'

        fill_in 'title', with: topic.title
        fill_in_react_ck 'textarea[name=text]', 'awesome text'

        find('#select').click
        find('#select-sticky').click
        find('button.btn-submit').click
        wait_for_page

        expect(forum.topics.last.topic_type).to eq('sticky')
      end

      scenario 'I can edit a topic from the topic show page' do
        topic = create(:forum_topic, forum: forum)

        # Edit with valid information.
        visit course_forum_topic_path(course, forum, topic)
        expect(page).to have_no_selector(".topic-subscribe-#{topic.id}")
        expect(page).to have_selector("button.topic-hide-#{topic.id}")
        expect(page).to have_selector("button.topic-lock-#{topic.id}")
        expect(page).to have_selector("button.topic-edit-#{topic.id}")
        expect(page).to have_selector("button.topic-delete-#{topic.id}")

        find("button.topic-edit-#{topic.id}").click

        new_title = 'new title'
        fill_in 'title', with: new_title
        find('.btn-submit').click

        expect_toastify("Topic #{new_title} has been updated.")
        expect(page).to have_text(new_title)

        # Edit with invalid information.
        find("button.topic-edit-#{topic.id}").click

        fill_in 'title', with: ''
        find('.btn-submit').click
        find_react_hook_form_error
      end

      scenario 'I can edit a topic from the topic index page' do
        topic = create(:forum_topic, forum: forum)

        # Edit with valid information.
        visit course_forum_path(course, forum)
        expect(page).to have_selector("tr.topic_#{topic.id}")

        find("button.topic-action-#{topic.id}").hover
        find("button.topic-edit-#{topic.id}").click

        new_title = 'new title'
        fill_in 'title', with: new_title
        find('.btn-submit').click

        expect_toastify("Topic #{new_title} has been updated.")
        within find("tr.topic_#{topic.id}") do
          expect(page).to have_text(new_title)
        end

        # Edit with invalid information.
        find("button.topic-action-#{topic.id}").hover
        find("button.topic-edit-#{topic.id}").click

        fill_in 'title', with: ''
        find('.btn-submit').click
        find_react_hook_form_error
      end

      scenario 'I can delete a topic from the topic show page' do
        topic = create(:forum_topic, forum: forum)
        visit course_forum_topic_path(course, forum, topic)

        expect do
          find("button.topic-delete-#{topic.id}").click
          accept_prompt
        end.to change { forum.topics.exists?(topic.id) }.to(false)

        expect(page).to have_current_path(course_forum_path(course, forum))
        expect(page).to have_no_selector("tr.topic_#{topic.id}")
      end

      scenario 'I can delete a topic from the topic index page' do
        topic = create(:forum_topic, forum: forum)
        visit course_forum_path(course, forum)

        expect(page).to have_selector("tr.topic_#{topic.id}")

        expect do
          find("button.topic-action-#{topic.id}").hover
          find("button.topic-delete-#{topic.id}").click
          accept_prompt
        end.to change { forum.topics.exists?(topic.id) }.to(false)

        expect(page).to have_no_selector("tr.topic_#{topic.id}")
      end

      scenario 'I can subscribe to a topic' do
        topic = create(:forum_topic, forum: forum)
        visit course_forum_path(course, forum)

        find(".topic-subscribe-#{topic.id}").click
        expect_toastify("You have successfully been subscribed to the forum topic #{topic.title}.")
        expect(topic.subscriptions.where(user: user).count).to eq(1)

        find(".topic-subscribe-#{topic.id}").click
        expect_toastify("You have successfully been unsubscribed from the forum topic #{topic.title}.")
        expect(topic.subscriptions.where(user: user).empty?).to eq(true)
      end

      scenario 'I can set lock state of a topic' do
        topic = create(:forum_topic, forum: forum, locked: false)

        # Set locked
        visit course_forum_topic_path(course, forum, topic)
        find("button.topic-lock-#{topic.id}").click

        expect_toastify("The topic \"#{topic.title}\" has successfully been locked.")
        expect(topic.reload.locked).to eq(true)

        # Set unlocked
        find("button.topic-lock-#{topic.id}").click
        expect_toastify("The topic \"#{topic.title}\" has successfully been unlocked.")
        expect(topic.reload.locked).to eq(false)
      end

      scenario 'I can set hide state of a topic' do
        topic = create(:forum_topic, forum: forum, hidden: false)

        # Set hidden
        visit course_forum_topic_path(course, forum, topic)
        find("button.topic-hide-#{topic.id}").click

        expect_toastify("The topic \"#{topic.title}\" has successfully been hidden.")
        expect(topic.reload.hidden).to eq(true)

        # Set shown
        find("button.topic-hide-#{topic.id}").click

        expect_toastify("The topic \"#{topic.title}\" has successfully been unhidden.")
        expect(topic.reload.hidden).to eq(false)
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can view the Forum Sidebar item' do
        visit course_path(course)

        expect(find_sidebar).to have_selector('#sidebar_item_forums')
      end

      scenario 'I can see shown topics' do
        topics = create_list(:forum_topic, 3, forum: forum)
        hidden_topic = create(:forum_topic, forum: forum, hidden: true)

        visit course_forum_path(course, forum)
        topics.each do |topic|
          within find("tr.topic_#{topic.id}") do
            expect(page).to have_link(topic.title, href: course_forum_topic_path(course, forum, topic))
            expect(page).to have_selector(".topic-subscribe-#{topic.id}")
            expect(page).to have_no_selector("button.topic-hide-#{topic.id}")
            expect(page).to have_no_selector("button.topic-lock-#{topic.id}")
            expect(page).to have_no_selector("button.topic-edit-#{topic.id}")
            expect(page).to have_no_selector("button.topic-delete-#{topic.id}")
          end
        end

        expect(page).to have_no_selector("tr.topic_#{hidden_topic.id}")
      end

      scenario 'I can create a new topic with normal and question types' do
        topic = build_stubbed(:forum_topic, forum: forum)

        visit course_forum_path(course, forum)

        click_button 'New Topic'
        expect(page).to have_selector('h2', text: 'New Topic')

        # Create a topic with a missing title.
        fill_in_react_ck 'textarea[name=text]', 'test'
        find('button.btn-submit').click
        find_react_hook_form_error

        # Create a normal topic with a title.
        fill_in 'title', with: topic.title

        find('#select').click
        find('#select-normal').click

        find('button.btn-submit').click
        wait_for_page

        expect_toastify("Topic #{topic.title} has been created.")
        expect(forum.topics.last.topic_type).to eq('normal')
        expect(forum.topics.last.posts.first.text).to eq('<p>test</p>')

        # Create a question topic with a title.
        visit course_forum_path(course, forum)
        click_button 'New Topic'

        fill_in 'title', with: topic.title
        fill_in_react_ck 'textarea[name=text]', 'awesome text'

        find('#select').click
        find('#select-question').click
        find('button.btn-submit').click
        wait_for_page

        expect_toastify("Topic #{topic.title} has been created.")
        expect(forum.topics.last.topic_type).to eq('question')
      end

      scenario 'I can edit my topic' do
        topic = create(:forum_topic, forum: forum, creator: user)
        other_topic = create(:forum_topic, forum: forum)

        # Edit with valid information.
        visit course_forum_topic_path(course, forum, topic)
        expect(page).to have_no_selector(".topic-subscribe-#{topic.id}")
        expect(page).to have_no_selector("button.topic-hide-#{topic.id}")
        expect(page).to have_no_selector("button.topic-lock-#{topic.id}")
        expect(page).to have_selector("button.topic-edit-#{topic.id}")
        expect(page).to have_no_selector("button.topic-delete-#{topic.id}")

        find("button.topic-edit-#{topic.id}").click

        new_title = 'new title'
        fill_in 'title', with: new_title
        find('.btn-submit').click

        expect_toastify("Topic #{new_title} has been updated.")
        expect(page).to have_text(new_title)

        # Edit with invalid information.
        find("button.topic-edit-#{topic.id}").click

        fill_in 'title', with: ''
        find('.btn-submit').click
        find_react_hook_form_error

        # Can not edit others' topic
        visit course_forum_topic_path(course, forum, other_topic)
        expect(page).to have_no_selector("button.topic-edit-#{topic.id}")
        expect(page).to have_no_selector("button.topic-delete-#{topic.id}")
      end

      scenario 'I can subscribe to a topic' do
        topic = create(:forum_topic, forum: forum)
        visit course_forum_path(course, forum)

        find(".topic-subscribe-#{topic.id}").click
        expect_toastify("You have successfully been subscribed to the forum topic #{topic.title}.")
        expect(topic.subscriptions.where(user: user).count).to eq(1)

        find(".topic-subscribe-#{topic.id}").click
        expect_toastify("You have successfully been unsubscribed from the forum topic #{topic.title}.")
        expect(topic.subscriptions.where(user: user).empty?).to eq(true)
      end

      scenario 'I can click unsubscribe forum topic link from an email' do
        topic = create(:forum_topic, forum: forum)
        topic.subscriptions.create(user: user)
        visit course_forum_topic_path(course, topic.forum, topic, subscribe_topic: false)
        expect(page).to have_current_path(course_forum_topic_path(course, forum, topic, { subscribe_topic: false }))
        expect_toastify("You have successfully been unsubscribed from the forum topic #{topic.title}.")
        expect(Course::Discussion::Topic::Subscription.where(user: user, topic: topic).empty?).to eq(true)

        # Go to the same link again
        visit course_forum_topic_path(course, topic.forum, topic, subscribe_topic: false)
        expect_toastify("You have successfully been unsubscribed from the forum topic #{topic.title}.")
      end
    end
  end
end
