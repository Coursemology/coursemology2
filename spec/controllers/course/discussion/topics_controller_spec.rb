# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Discussion::TopicsController do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course, creator: user) }
    let(:student) { create(:course_user, course: course).user }
    let!(:topic) do
      create(:course_assessment_answer, :with_post, course: course, creator: student).acting_as
    end
    let!(:pending_topic) do
      create(:course_assessment_answer, :with_post, :pending,
             course: course, creator: student).acting_as
    end
    let(:topics) { controller.instance_variable_get(:@topics) }

    before { sign_in(user) }

    describe '#index' do
      subject { get :index, course_id: course }

      it { is_expected.to render_template(:index) }

      it 'shows all topics' do
        subject
        expect(topics).to contain_exactly(topic, pending_topic)
      end
    end

    describe '#pending' do
      subject { get :pending, course_id: course }

      it { is_expected.to render_template(:pending) }

      it 'only shows the pending topics' do
        subject
        expect(topics).to contain_exactly(pending_topic)
      end
    end

    describe '#my_students' do
      subject { get :my_students, course_id: course }

      it { is_expected.to render_template(:my_students) }

      context 'when the user does not have any students' do
        it 'shows nothing' do
          subject
          expect(topics).to be_empty
        end
      end

      context 'when the user has students' do
        before do
          group = create(:course_group, course: course, creator: user)
          student_course_user = course.course_users.find_by(user_id: student)
          create(:course_group_user, course: course, group: group, course_user: student_course_user)
        end

        it "shows my students' topics" do
          subject
          expect(topics).to contain_exactly(topic, pending_topic)
        end
      end
    end

    describe '#my_students_pending' do
      subject { get :my_students_pending, course_id: course }

      it { is_expected.to render_template(:my_students_pending) }

      context 'when the user does not have any students' do
        it 'shows nothing' do
          subject
          expect(topics).to be_empty
        end
      end

      context 'when the user has students' do
        before do
          group = create(:course_group, course: course, creator: user)
          student_course_user = course.course_users.find_by(user_id: student)
          create(:course_group_user, course: course, group: group, course_user: student_course_user)
        end

        it "shows my students' pending topics" do
          subject
          expect(topics).to contain_exactly(pending_topic)
        end
      end
    end
  end
end
