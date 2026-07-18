# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::TextResponseSolutionSpreadsheet, type: :model do
  it 'belongs to solution' do
    expect(subject).to belong_to(:solution).
      class_name(Course::Assessment::Question::TextResponseSolution.name)
  end

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#assign_params' do
      subject { described_class.new }

      it 'assigns the target sheet name' do
        subject.assign_params(target_sheet_name: 'Sheet2')

        expect(subject.target_sheet_name).to eq('Sheet2')
      end

      it 'leaves the target sheet name nil when not provided' do
        subject.assign_params(num_random_tests: 3)

        expect(subject.target_sheet_name).to be_nil
      end
    end

    describe '#initialize_duplicate' do
      let(:duplicator) { double.tap { |d| allow(d).to receive(:duplicate).and_return(nil) } }
      let(:other) { described_class.new(target_sheet_name: 'Data', num_random_tests: 5) }

      it 'copies the target sheet name to the duplicate' do
        subject.initialize_duplicate(duplicator, other)

        expect(subject.target_sheet_name).to eq('Data')
        expect(subject.num_random_tests).to eq(5)
      end
    end
  end
end
