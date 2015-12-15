require 'rails_helper'

RSpec.describe Course::Level, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:levels) }
  it 'ensures that experience points threshold is greater or equal to 0' do
    expect(subject).
      to validate_numericality_of(:experience_points_threshold).
      is_greater_than_or_equal_to(0)
  end

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let!(:course) { build(:course) }

    describe 'validations' do
      describe 'uniqueness of experience points threshold' do
        context 'when level have the same threshold as existing level' do
          before { create(:course_level, course: course, experience_points_threshold: 100) }
          subject { build(:course_level, course: course, experience_points_threshold: 100) }

          it 'is invalid' do
            expect(subject).not_to be_valid
          end
        end
      end
    end

    context 'before level_number is set' do
      it 'raises an IllegalStateError' do
        expect { Course::Level.new.level_number }.to raise_error(IllegalStateError)
      end
    end

    describe '.after_course_initialize' do
      it 'builds one default level' do
        expect(course.levels.size).to eq(1)
      end

      context 'when course is initialised again' do
        it 'does not build another level' do
          level = course.levels.first

          # Call the callback one more time
          Course::Level.after_course_initialize(course)
          expect(course.levels.size).to eq(1)

          course.save
          expect(level).to be_persisted
        end
      end
    end

    describe '.default_level?' do
      context 'when the level is a default level' do
        it 'returns true' do
          level = build(:course_level, experience_points_threshold: 0)
          expect(level).to be_default_level
        end
      end

      context 'when the level is not a default level' do
        it 'returns false' do
          level = build(:course_level, experience_points_threshold: 1)
          expect(level).not_to be_default_level
        end
      end
    end
  end
end
