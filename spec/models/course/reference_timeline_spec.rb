# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ReferenceTimeline, type: :model do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:timeline) { create(:course_reference_timeline, course: course) }

    it { should belong_to(:course).inverse_of(:reference_timelines).without_validating_presence }
    it { should have_many(:reference_times).inverse_of(:reference_timeline).dependent(:destroy) }
    it {
      should have_many(:course_users).
        with_foreign_key(:reference_timeline_id).
        inverse_of(:reference_timeline).
        dependent(:restrict_with_error)
    }

    it { should accept_nested_attributes_for(:reference_times) }

    describe '#validations' do
      let(:title) { 'Test Timeline Title' }

      context 'when timeline is default' do
        subject { course.default_reference_timeline }

        it 'cannot be destroyed' do
          expect { subject.destroy! }.to raise_error(ActiveRecord::RecordNotDestroyed)
          expect(subject.destroyed?).to be_falsey
          expect(subject.errors.messages).to have_key(:default)
        end

        it 'has title optional' do
          expect { subject.update!(title: title) }.not_to raise_error
          expect(subject.title).to eq(title)

          expect { subject.update!(title: nil) }.not_to raise_error
          expect(subject.title).to be_nil

          expect(subject.errors.messages).to be_empty
        end

        it 'has weight set to zero' do
          expect(subject.weight).to eq(0)
        end
      end

      context 'when timeline is not default' do
        let(:default_timeline) { course.default_reference_timeline }

        subject { timeline }

        it 'must have a title' do
          expect { subject.update!(title: nil) }.to raise_error(ActiveRecord::RecordInvalid)
          expect(subject.errors.messages).to have_key(:title)

          expect { subject.update!(title: title) }.not_to raise_error
          expect(subject.title).to eq(title)
          expect(subject.errors.messages).to be_empty
        end

        it 'cannot be the default timeline in the same course' do
          expect(subject.default).to be_falsey
          expect { subject.update!(default: true) }.to raise_error(ActiveRecord::RecordInvalid)
          expect(subject.errors.messages).to have_key(:default)

          expect(subject.reload.default).to be_falsey
          expect(course.default_reference_timeline).to eq(default_timeline)
        end

        it 'has a weight set' do
          expect(subject.weight).to eq(1)
        end

        context 'when is assigned to some course users' do
          let!(:student) { create(:course_student, course: course, reference_timeline: timeline) }

          it 'cannot be destroyed' do
            expect { subject.destroy! }.to raise_error(ActiveRecord::RecordNotDestroyed)
            expect(subject.destroyed?).to be_falsey
            expect(student.reference_timeline).to eq(subject)
            expect(subject.course_users).to include(student)
          end
        end

        context 'when it can be destroyed' do
          it 'is destroyed' do
            expect { subject.destroy! }.not_to raise_error
            expect(subject.destroyed?).to be_truthy
            expect(subject.errors.messages).to be_empty
          end

          context 'and it has reference times' do
            let(:item) { create(:course_lesson_plan_item, course: course) }
            let!(:time) { create(:course_reference_time, lesson_plan_item: item, reference_timeline: subject) }

            it { is_expected.to have_many(:reference_times).dependent(:destroy) }

            it 'destroys all of its reference times' do
              expect { subject.destroy! }.not_to raise_error
              expect(subject.destroyed?).to be_truthy
              expect(subject.errors.messages).to be_empty

              expect { time.reload }.to raise_error(ActiveRecord::RecordNotFound)
            end
          end
        end
      end

      context 'when weight is set to nil' do
        subject { timeline }

        it 'cannot be saved' do
          expect { subject.update!(weight: nil) }.to raise_error(ActiveRecord::RecordInvalid)
        end
      end
    end
  end
end
