require 'rails_helper'

RSpec.describe 'Extension: Acts as Condition', type: :model do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:achievement) do
      build(:achievement).tap do |a|
        cond = build(:achievement_condition)
        cond.conditional = a
        cond.save
      end
    end

    describe 'objects which act as conditions' do
      subject do
        Class.new(ActiveRecord::Base) do
          def self.columns
            []
          end
          acts_as_condition
        end.new
      end

      it 'must implement #title' do
        expect(subject).to respond_to(:title)
        expect { subject.title }.to raise_error(NotImplementedError)
      end
    end
  end
end
