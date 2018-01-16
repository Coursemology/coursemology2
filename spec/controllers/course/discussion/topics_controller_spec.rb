# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Discussion::TopicsController do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:staff) { create(:course_teaching_assistant, course: course).user }
    let(:student) { create(:course_student, course: course).user }
    let!(:topic) do
      create(:course_assessment_submission_question, :with_post,
             course: course, user: student).acting_as
    end
    let!(:pending_topic) do
      create(:course_assessment_submission_question, :with_post, :pending,
             course: course, user: student).acting_as
    end
    let(:topics) { controller.instance_variable_get(:@topics) }

    describe '#index' do
      subject { get :index, params: { course_id: course } }

      context 'when a course staff visits the page' do
        before { sign_in(staff) }

        it { is_expected.to render_template(:index) }

        it 'shows all topics' do
          subject
          expect(topics).to contain_exactly(topic, pending_topic)
        end

        context 'when the discussion topics component is disabled' do
          before do
            allow(controller).to receive_message_chain('current_component_host.[]').and_return(nil)
          end

          it 'raises an component not found error' do
            expect { subject }.to raise_error(ComponentNotFoundError)
          end
        end
      end

      context 'when a course student visits the page' do
        before { sign_in(student) }

        it { is_expected.to render_template(:index) }

        it "shows student's own topics" do
          subject
          expect(topics).to contain_exactly(topic, pending_topic)
        end
      end
    end

    describe '#pending' do
      subject { get :pending, params: { course_id: course } }

      context 'when a course staff visits the page' do
        before { sign_in(staff) }

        it { is_expected.to render_template(:pending) }

        it 'only shows the pending topics' do
          subject
          expect(topics).to contain_exactly(pending_topic)
        end
      end

      context 'when a course student visits the page' do
        before { sign_in(student) }

        it { is_expected.to render_template(:pending) }

        it 'only shows the unread topics' do
          subject
          expect(topics).to contain_exactly(topic, pending_topic)
        end
      end
    end

    describe '#my_students' do
      subject { get :my_students, params: { course_id: course } }

      context 'when a course staff visits the page' do
        before { sign_in(staff) }

        it { is_expected.to render_template(:my_students) }

        context 'when the user does not have any students' do
          it 'shows nothing' do
            subject
            expect(topics).to be_empty
          end
        end

        context 'when the user has students' do
          before do
            group = create(:course_group, course: course, creator: staff)
            student_course_user = course.course_users.find_by(user_id: student)
            create(:course_group_user,
                   course: course, group: group, course_user: student_course_user)
          end

          it "shows my students' topics" do
            subject
            expect(topics).to contain_exactly(topic, pending_topic)
          end
        end
      end

      context 'when a course student visits the page' do
        before { sign_in(student) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#my_students_pending' do
      subject { get :my_students_pending, params: { course_id: course } }

      context 'when a course staff visits the page' do
        before { sign_in(staff) }

        it { is_expected.to render_template(:my_students_pending) }

        context 'when the user does not have any students' do
          it 'shows nothing' do
            subject
            expect(topics).to be_empty
          end
        end

        context 'when the user has students' do
          before do
            group = create(:course_group, course: course, creator: staff)
            student_course_user = course.course_users.find_by(user_id: student)
            create(:course_group_user,
                   course: course, group: group, course_user: student_course_user)
          end

          it "shows my students' pending topics" do
            subject
            expect(topics).to contain_exactly(pending_topic)
          end
        end
      end

      context 'when a course student visits the page' do
        before { sign_in(student) }

        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end
  end
end
