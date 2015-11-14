require 'rails_helper'

RSpec.describe Course::Assessment::Category do
  it { is_expected.to belong_to(:course) }
  it { is_expected.to have_many(:tabs) }
  it { is_expected.to have_many(:assessments).through(:tabs) }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '.default_scope' do
      let(:course) { create(:course) }
      let!(:categories) { create_list(:course_assessment_category, 2, course: course) }
      it 'orders by ascending weight' do
        weights = course.assessment_categories.map(&:weight)
        expect(weights.length).to be > 1
        expect(weights.each_cons(2).all? { |a, b| a <= b }).to be_truthy
      end
    end

    context 'after category was initialized' do
      subject { build(:course_assessment_category) }

      it 'creates a folder' do
        expect(subject.folder).to be_present

        subject.save
        expect(subject.folder).to be_persisted
        expect(subject.folder.name).to eq(subject.title)
        expect(subject.folder.course).to eq(subject.course)
        expect(subject.folder.parent).to eq(subject.course.root_folder)
      end
    end

    describe 'after category title was changed' do
      subject { create(:course_assessment_category) }

      it 'updates the folder title' do
        new_title = 'Mission'

        subject.title = new_title
        subject.save

        expect(subject.folder.name).to eq(new_title)
      end
    end
  end
end
