require 'rails_helper'

RSpec.describe Course, type: :model do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:owner) { create(:user) }

    it { is_expected.to belong_to(:creator) }
    it { is_expected.to have_many(:course_users).inverse_of(:course).dependent(:destroy) }
    it { is_expected.to have_many(:users).through(:course_users) }
    it { is_expected.to have_many(:announcements).inverse_of(:course).dependent(:destroy) }
    it { is_expected.to have_many(:levels).inverse_of(:course).dependent(:destroy) }
    it { is_expected.to have_many(:groups).inverse_of(:course).dependent(:destroy) }
    it { is_expected.to have_many(:lesson_plan_items).inverse_of(:course).dependent(:destroy) }

    it { is_expected.to validate_presence_of(:title) }

    context 'when course is created' do
      subject { Course.new(creator: owner, updater: owner) }

      it { is_expected.not_to be_published }
      it { is_expected.not_to be_opened }

      it 'contains the provided user as the owner' do
        expect(subject.course_users.map(&:user)).to include(owner)
      end

      context 'when the creator is specified after initialisation' do
        subject { Course.new }
        before do
          subject.creator = subject.updater = owner
          subject.save
        end

        it 'contains the provided user as the owner' do
          expect(subject.course_users.map(&:user)).to include(owner)
        end
      end
    end

    describe 'levels' do
      let!(:user) { create(:administrator) }
      let!(:course) { create(:course) }
      let!(:levels) do
        create_list(:course_level, 5, course: course).map(&:experience_points_threshold)
      end

      describe '.levels' do
        it 'returns levels is ascending order' do
          course_level_numbers = course.levels.map(&:experience_points_threshold)
          expect(course_level_numbers).to eq levels
        end
      end

      describe '#compute_level' do
        it 'returns nil when experience_points is 0' do
          level = course.compute_level(0)
          expect(level).to be_nil
        end
      end

      describe '#compute_level_number' do
        context 'when experience_points is 0' do
          it 'returns 0' do
            level = course.compute_level_number(0)
            expect(level).to eq 0
          end
        end

        context 'when experience_points is between threshold' do
          it 'returns the correct level number' do
            experience_points = levels.max - 1
            level = course.compute_level_number(experience_points)
            expect(level).to eq levels.size - 1
          end
        end

        context 'when experience_points coincides with a level threshold' do
          it 'returns the correct level number' do
            experience_points = levels[1]
            level = course.compute_level_number(experience_points)
            expect(level).to eq 2
          end
        end

        context 'when experience_points exceeds all level thresholds' do
          it 'returns the correct level number' do
            experience_points = levels.max + 1
            level = course.compute_level_number(experience_points)
            expect(level).to eq levels.size
          end
        end
      end

      describe '#numbered_levels' do
        it 'numbers levels' do
          numbering = course.numbered_levels.map(&:level_number)
          expect(numbering).to eq((1..(levels.size)).to_a)
        end
      end
    end

    describe '#staff' do
      let(:course) { create(:course, creator: owner, updater: owner) }
      let(:course_owner) { course.course_users.find_by!(user: owner) }
      let(:teaching_assistant) { create(:course_teaching_assistant, course: course) }
      let(:manager) { create(:course_manager, course: course) }

      it 'returns all the staff in course' do
        expect(course.staff).to contain_exactly(teaching_assistant, manager, course_owner)
      end
    end
  end
end
