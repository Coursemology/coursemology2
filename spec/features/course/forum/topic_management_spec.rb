# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Forum: Topic: Management' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:forum) { create(:forum, course: course) }
    before { login_as(user, scope: :user) }

    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }
      scenario 'I can see topics' do
        topics = create_list(:forum_topic, 2, forum: forum)
        visit course_forum_path(course, forum)
        topics.each do |topic|
          expect(page).to have_link(topic.title,
                                    href: course_forum_topic_path(course, forum, topic))
          expect(page).to have_content_tag_for(topic)
        end
      end

      scenario 'I can create a new topic with all types' do
        topic = build_stubbed(:forum_topic, forum: forum)

        visit course_forum_path(course, forum)
        find_link(nil, href: new_course_forum_topic_path(course, forum)).click

        expect(current_path).to eq(new_course_forum_topic_path(course, forum))

        # Create a topic with a missing title.
        click_button 'submit'

        expect(current_path).to eq(course_forum_topics_path(course, forum))
        expect(page).to have_selector('div.alert.alert-danger')

        # Create an announcement topic with a title.
        fill_in 'title', with: topic.title
        fill_in 'text', with: 'test'

        within '.topic_topic_type' do
          find("input[value='announcement']").click
        end
        click_button 'submit'

        expect(current_path).to eq(course_forum_topic_path(course, forum, forum.topics.last))
        expect(forum.topics.last.topic_type).to eq('announcement')
        expect(forum.topics.last.posts.first.text).to eq('test')

        # Create a sticky topic with a title.
        visit course_forum_path(course, forum)
        find_link(nil, href: new_course_forum_topic_path(course, forum)).click

        fill_in 'title', with: topic.title
        fill_in 'text', with: 'awesome text'

        within '.topic_topic_type' do
          find("input[value='sticky']").click
        end
        click_button 'submit'

        expect(current_path).to eq(course_forum_topic_path(course, forum, forum.topics.last))
        expect(forum.topics.last.topic_type).to eq('sticky')
      end

      scenario 'I can edit a topic' do
        topic = create(:forum_topic, forum: forum)

        # Edit with valid information.
        visit course_forum_topic_path(course, forum, topic)
        find_link(nil, href: edit_course_forum_topic_path(course, forum, topic)).click

        new_title = 'new title'
        fill_in 'title', with: new_title
        click_button 'submit'

        expect(current_path).to eq(course_forum_topic_path(course, forum, topic.reload))
        expect(page).to have_selector('h1', text: new_title)

        # Edit with invalid information.
        visit course_forum_topic_path(course, forum, topic)
        find_link(nil, href: edit_course_forum_topic_path(course, forum, topic)).click

        fill_in 'title', with: ''
        click_button 'submit'

        expect(current_path).to eq(course_forum_topic_path(course, forum, topic.reload))
        expect(page).to have_selector('div.alert.alert-danger')
      end

      scenario 'I can delete a topic' do
        topic = create(:forum_topic, forum: forum)
        visit course_forum_topic_path(course, forum, topic)

        within find(:css, '.page-header') do
          expect { find(:css, 'a.delete').click }.to \
            change { forum.topics.exists?(topic.id) }.to(false)
        end
        expect(current_path).to eq(course_forum_path(course, forum))

        expect(page).to have_no_content_tag_for(topic)
      end

      scenario 'I can subscribe to a topic', js: true do
        topic = create(:forum_topic, forum: forum)
        visit course_forum_topic_path(course, forum, topic)
        find_link(nil,
                  href: subscribe_course_forum_topic_path(course, forum, topic,
                                                          subscribe: true)).click

        wait_for_ajax
        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))
        expect(page).to have_link(nil,
                                  href: subscribe_course_forum_topic_path(course, forum, topic,
                                                                          subscribe: false))
        expect(topic.subscriptions.where(user: user).count).to eq(1)
      end

      scenario 'I can unsubscribe from a topic', js: true do
        topic = create(:forum_topic, forum: forum)
        topic.subscriptions.create(user: user)
        visit course_forum_topic_path(course, forum, topic)
        find_link(nil,
                  href: subscribe_course_forum_topic_path(course, forum, topic,
                                                          subscribe: false)).click

        wait_for_ajax
        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))
        expect(page).to have_link(nil,
                                  href: subscribe_course_forum_topic_path(course, forum, topic,
                                                                          subscribe: true))
        expect(topic.subscriptions.where(user: user).empty?).to eq(true)
      end

      scenario 'I can set lock state of a topic' do
        topic = create(:forum_topic, forum: forum, locked: false)

        # Set locked
        visit course_forum_topic_path(course, forum, topic)
        find_link(I18n.t('course.forum.topics.locked.tag'),
                  href: locked_course_forum_topic_path(course, forum, topic, locked: true)).click

        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))
        expect(page).to have_link(I18n.t('course.forum.topics.unlocked.tag'),
                                  href: locked_course_forum_topic_path(course, forum, topic,
                                                                       locked: false))
        expect(topic.reload.locked).to eq(true)

        # Set unlocked
        find_link(I18n.t('course.forum.topics.unlocked.tag'),
                  href: locked_course_forum_topic_path(course, forum, topic, locked: false)).click
        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))
        expect(page).to have_link(I18n.t('course.forum.topics.locked.tag'),
                                  href: locked_course_forum_topic_path(course, forum, topic,
                                                                       locked: true))
        expect(topic.reload.locked).to eq(false)
      end

      scenario 'I can set hide state of a topic' do
        topic = create(:forum_topic, forum: forum, hidden: false)

        # Set hidden
        visit course_forum_topic_path(course, forum, topic)
        find_link(I18n.t('course.forum.topics.hidden.tag'),
                  href: hidden_course_forum_topic_path(course, forum, topic, hidden: true)).click

        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))
        expect(page).to have_link(I18n.t('course.forum.topics.unhidden.tag'),
                                  href: hidden_course_forum_topic_path(course, forum, topic,
                                                                       hidden: false))
        expect(topic.reload.hidden).to eq(true)

        # Set shown
        find_link(I18n.t('course.forum.topics.unhidden.tag'),
                  href: hidden_course_forum_topic_path(course, forum, topic, hidden: false)).click
        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))
        expect(page).to have_link(I18n.t('course.forum.topics.hidden.tag'),
                                  href: hidden_course_forum_topic_path(course, forum, topic,
                                                                       hidden: true))
        expect(topic.reload.hidden).to eq(false)
      end
    end

    context 'As a Course Student' do
      let(:user) { create(:course_student, course: course).user }

      scenario 'I can view the Forum Sidebar item' do
        visit course_path(course)

        expect(page).to have_selector('li', text: 'course.forum.forums.sidebar_title')
      end

      scenario 'I can see shown topics' do
        topic = create(:forum_topic, forum: forum)
        hidden_topic = create(:forum_topic, forum: forum, hidden: true)

        visit course_forum_path(course, forum)
        expect(page).to have_link(topic.title,
                                  href: course_forum_topic_path(course, forum, topic))
        expect(page).to have_content_tag_for(topic)
        expect(page).not_to have_link(hidden_topic.title,
                                      href: course_forum_topic_path(course, forum, hidden_topic))
        expect(page).to have_no_content_tag_for(hidden_topic)
      end

      scenario 'I can create a new topic with normal and question types' do
        topic = build_stubbed(:forum_topic, forum: forum)

        visit course_forum_path(course, forum)
        find_link(nil, href: new_course_forum_topic_path(course, forum)).click

        expect(current_path).to eq(new_course_forum_topic_path(course, forum))

        # Create a topic with a missing title.
        click_button 'submit'

        expect(current_path).to eq(course_forum_topics_path(course, forum))
        expect(page).to have_selector('div.alert.alert-danger')

        # Create an announcement topic with a title.
        fill_in 'title', with: topic.title
        fill_in 'text', with: 'test'

        within '.topic_topic_type' do
          find("input[value='normal']").click
        end
        click_button 'submit'

        expect(current_path).to eq(course_forum_topic_path(course, forum, forum.topics.last))
        expect(forum.topics.last.topic_type).to eq('normal')
        expect(forum.topics.last.posts.first.text).to eq('test')

        # Create a sticky topic with a title.
        visit course_forum_path(course, forum)
        find_link(nil, href: new_course_forum_topic_path(course, forum)).click

        fill_in 'title', with: topic.title
        fill_in 'text', with: 'awesome text'

        within '.topic_topic_type' do
          find("input[value='question']").click
        end
        click_button 'submit'

        expect(current_path).to eq(course_forum_topic_path(course, forum, forum.topics.last))
        expect(forum.topics.last.topic_type).to eq('question')
      end

      scenario 'I can edit my topic' do
        topic = create(:forum_topic, forum: forum, creator: user)
        other_topic = create(:forum_topic, forum: forum)

        # Edit with valid information.
        visit course_forum_topic_path(course, forum, topic)
        find_link(nil, href: edit_course_forum_topic_path(course, forum, topic)).click

        new_title = 'new title'
        fill_in 'title', with: new_title
        click_button 'submit'

        expect(current_path).to eq(course_forum_topic_path(course, forum, topic.reload))
        expect(page).to have_selector('h1', text: new_title)

        # Edit with invalid information.
        visit course_forum_topic_path(course, forum, topic)
        find_link(nil, href: edit_course_forum_topic_path(course, forum, topic)).click

        fill_in 'title', with: ''
        click_button 'submit'

        expect(current_path).to eq(course_forum_topic_path(course, forum, topic.reload))
        expect(page).to have_selector('div.alert.alert-danger')

        # Can not edit others' topic
        visit course_forum_topic_path(course, forum, other_topic)
        expect(page).not_to have_link(nil, href: edit_course_forum_topic_path(course, forum,
                                                                              other_topic))
      end

      scenario 'I can subscribe to a topic', js: true do
        topic = create(:forum_topic, forum: forum)
        visit course_forum_topic_path(course, forum, topic)
        find_link(nil,
                  href: subscribe_course_forum_topic_path(course, forum, topic,
                                                          subscribe: true)).click

        wait_for_ajax
        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))
        expect(page).to have_link(nil,
                                  href: subscribe_course_forum_topic_path(course, forum, topic,
                                                                          subscribe: false))
        expect(topic.subscriptions.where(user: user).count).to eq(1)
      end

      scenario 'I can unsubscribe from a topic', js: true do
        topic = create(:forum_topic, forum: forum)
        topic.subscriptions.create(user: user)
        visit course_forum_topic_path(course, forum, topic)
        find_link(nil,
                  href: subscribe_course_forum_topic_path(course, forum, topic,
                                                          subscribe: false)).click
        wait_for_ajax

        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))
        expect(page).to have_link(nil,
                                  href: subscribe_course_forum_topic_path(course, forum, topic,
                                                                          subscribe: true))
        expect(topic.subscriptions.where(user: user).empty?).to eq(true)
      end

      scenario 'I can click unsubscribe forum topic link from an email' do
        topic = create(:forum_topic, forum: forum)
        topic.subscriptions.create(user: user)
        visit subscribe_course_forum_topic_path(course, forum, topic, subscribe: false)
        expect(current_path).to eq(course_forum_topic_path(course, forum, topic))
        expect(page).to have_selector('div.alert.alert-success')
        expect(page).to have_text(I18n.t('course.forum.topics.unsubscribe.success'))
        expect(Course::Discussion::Topic::Subscription.where(user: user, topic: topic).empty?).to eq(true)
      end
    end
  end
end
