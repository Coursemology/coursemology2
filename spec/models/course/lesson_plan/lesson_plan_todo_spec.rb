# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LessonPlan::Todo, type: :model do
  it { is_expected.to belong_to(:item).inverse_of(:todos) }
  it { is_expected.to belong_to(:user).inverse_of(:todos) }

  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course) }
    let(:student) { create(:course_student, course: course, user: user) }

    describe '.opened' do
      let!(:todo) { create(:course_lesson_plan_todo, *todo_traits, course: course, user: user) }
      subject { user.todos.opened }

      context 'when item has started' do
        let(:todo_traits) { :opened }
        it { is_expected.to contain_exactly(todo) }
      end

      context 'when item has not started' do
        let(:todo_traits) { :not_opened }
        it { is_expected.not_to include(todo) }
      end
    end

    describe '.published' do
      let!(:todo) do
        create(:course_lesson_plan_todo, published: published, course: course, user: user)
      end
      subject { user.todos.published }

      context 'when item is published' do
        let(:published) { true }
        it { is_expected.to contain_exactly(todo) }
      end

      context 'when item is not published' do
        let(:published) { false }
        it { is_expected.not_to include(todo) }
      end
    end

    describe '.not_ignored' do
      let!(:todo) { create(:course_lesson_plan_todo, ignore: ignore, course: course, user: user) }
      subject { user.todos.not_ignored }

      context 'when item is not ignored' do
        let(:ignore) { false }
        it { is_expected.to contain_exactly(todo) }
      end

      context 'when item is ignored' do
        let(:ignore) { true }
        it { is_expected.not_to include(todo) }
      end
    end

    describe '.from_course' do
      let(:other_course) { create(:course) }
      let(:other_course_user) { create(:course_student, course: other_course, user: user) }
      let!(:other_todo) { create(:course_lesson_plan_todo, course: other_course, user: user) }
      let!(:todo) { create(:course_lesson_plan_todo, course: course, user: user) }
      subject { user.todos.from_course(course) }

      it { is_expected.to contain_exactly(todo) }
    end

    describe '.not_completed' do
      let!(:todo_not_started) do
        create(:course_lesson_plan_todo, :not_started, course: course, user: user)
      end
      let!(:todo_in_progress) do
        create(:course_lesson_plan_todo, :in_progress, course: course, user: user)
      end
      let!(:todo_completed) do
        create(:course_lesson_plan_todo, :completed, course: course, user: user)
      end
      subject { user.todos.not_completed }

      it { is_expected.to contain_exactly(todo_not_started, todo_in_progress) }
    end

    describe '.pending_for' do
      let(:other_course_user) { create(:course_student, course: course) }
      let!(:todo) do
        create(:course_lesson_plan_todo, :opened, published: true, course: course, user: user)
      end
      let(:item) { todo.item }
      let!(:other_todo) do
        create(:course_lesson_plan_todo, item: item, course: course, user: other_course_user.user)
      end
      subject { Course::LessonPlan::Todo.pending_for(student) }

      it 'returns the opened, not ignored and published todos from the correct user' do
        expect(subject).to contain_exactly(todo)
      end

      context 'when todo is completed' do
        let!(:completed_todo) do
          create(:course_lesson_plan_todo, :opened, :completed,
                 published: true, course: course, user: user)
        end
        it 'is not included' do
          expect(subject).not_to include(completed_todo)
        end
      end
    end
  end
end
