# frozen_string_literal: true
require 'rails_helper'

RSpec.feature 'Course: Forum: Topic: Management', js: true do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course, :with_rag_wise_component_enabled) }
    let(:forum) { create(:forum, course: course) }
    before do
      login_as(user, scope: :user)
      allow_any_instance_of(Course::Discussion::Post).to receive(:rag_auto_answer!)
    end
    context 'As a Course Manager' do
      let(:user) { create(:course_manager, course: course).user }
      let(:topic) { build_stubbed(:forum_topic, forum: forum) }

      scenario 'I can create normal topics without triggering an automatic response' do
        visit course_forum_path(course, forum)

        click_button 'New Topic'

        # Create a normal topic
        fill_in_react_ck 'textarea[name=text]', 'test'
        find('button.btn-submit').click
        fill_in 'title', with: topic.title

        find('#select').click
        find('#select-normal').click

        expect_any_instance_of(Course::Discussion::Post).to_not receive(:rag_auto_answer!).once
        find('button.btn-submit').click
        wait_for_page
      end

      scenario 'I can create question topics without triggering an automatic response' do
        visit course_forum_path(course, forum)

        click_button 'New Topic'

        # Create a question topic
        fill_in_react_ck 'textarea[name=text]', 'awesome text'
        find('button.btn-submit').click
        fill_in 'title', with: topic.title

        find('#select').click
        find('#select-question').click

        expect_any_instance_of(Course::Discussion::Post).to_not receive(:rag_auto_answer!).once
        find('button.btn-submit').click
        wait_for_page
      end

      scenario 'I can create announcement topics without triggering an automatic response' do
        visit course_forum_path(course, forum)

        click_button 'New Topic'

        # Create a announcement topic
        fill_in_react_ck 'textarea[name=text]', 'awesome text'
        find('button.btn-submit').click
        fill_in 'title', with: topic.title

        find('#select').click
        find('#select-announcement').click

        expect_any_instance_of(Course::Discussion::Post).to_not receive(:rag_auto_answer!).once
        find('button.btn-submit').click
        wait_for_page
      end

      scenario 'I can create sticky topics without triggering an automatic response' do
        visit course_forum_path(course, forum)

        click_button 'New Topic'

        # Create a sticky topic
        fill_in_react_ck 'textarea[name=text]', 'awesome text'
        find('button.btn-submit').click
        fill_in 'title', with: topic.title

        find('#select').click
        find('#select-sticky').click

        expect_any_instance_of(Course::Discussion::Post).to_not receive(:rag_auto_answer!).once
        find('button.btn-submit').click
        wait_for_page
      end
    end

    context 'As a teaching staff' do
      let(:user) { create(:course_teaching_assistant, course: course).user }
      let(:topic) { build_stubbed(:forum_topic, forum: forum) }

      scenario 'I can create normal topics without triggering an automatic response' do
        visit course_forum_path(course, forum)

        click_button 'New Topic'

        # Create a normal topic
        fill_in_react_ck 'textarea[name=text]', 'test'
        find('button.btn-submit').click
        fill_in 'title', with: topic.title

        find('#select').click
        find('#select-normal').click

        expect_any_instance_of(Course::Discussion::Post).to_not receive(:rag_auto_answer!).once
        find('button.btn-submit').click
        wait_for_page
      end

      scenario 'I can create question topics without triggering an automatic response' do
        visit course_forum_path(course, forum)

        click_button 'New Topic'

        # Create a question topic
        fill_in_react_ck 'textarea[name=text]', 'awesome text'
        find('button.btn-submit').click
        fill_in 'title', with: topic.title

        find('#select').click
        find('#select-question').click

        expect_any_instance_of(Course::Discussion::Post).to_not receive(:rag_auto_answer!).once
        find('button.btn-submit').click
        wait_for_page
      end

      scenario 'I can create announcement topics without triggering an automatic response' do
        visit course_forum_path(course, forum)

        click_button 'New Topic'

        # Create a announcement topic
        fill_in_react_ck 'textarea[name=text]', 'awesome text'
        find('button.btn-submit').click
        fill_in 'title', with: topic.title

        find('#select').click
        find('#select-announcement').click

        expect_any_instance_of(Course::Discussion::Post).to_not receive(:rag_auto_answer!).once
        find('button.btn-submit').click
        wait_for_page
      end

      scenario 'I can create sticky topics without triggering an automatic response' do
        visit course_forum_path(course, forum)

        click_button 'New Topic'

        # Create a sticky topic
        fill_in_react_ck 'textarea[name=text]', 'awesome text'
        find('button.btn-submit').click
        fill_in 'title', with: topic.title

        find('#select').click
        find('#select-sticky').click

        expect_any_instance_of(Course::Discussion::Post).to_not receive(:rag_auto_answer!).once
        find('button.btn-submit').click
        wait_for_page
      end
    end

    context 'As a Student' do
      let(:user) { create(:course_student, course: course).user }
      let(:topic) { build_stubbed(:forum_topic, forum: forum) }
      scenario 'I can create normal topics that trigger an automatic response' do
        visit course_forum_path(course, forum)

        click_button 'New Topic'

        # Create a Normal topic
        fill_in_react_ck 'textarea[name=text]', 'test'
        find('button.btn-submit').click
        fill_in 'title', with: topic.title
        find('#select').click
        find('#select-normal').click

        expect_any_instance_of(Course::Discussion::Post).to receive(:rag_auto_answer!).once

        find('button.btn-submit').click
        wait_for_page
      end

      scenario 'I can create question topics that trigger an automatic response' do
        visit course_forum_path(course, forum)

        click_button 'New Topic'

        # Create a quesion topic
        fill_in_react_ck 'textarea[name=text]', 'test'
        find('button.btn-submit').click
        fill_in 'title', with: topic.title
        find('#select').click
        find('#select-question').click

        expect_any_instance_of(Course::Discussion::Post).to receive(:rag_auto_answer!).once
        find('button.btn-submit').click
        wait_for_page
      end
    end
  end
end
