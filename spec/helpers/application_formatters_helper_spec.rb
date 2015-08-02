require 'rails_helper'

RSpec.describe ApplicationFormattersHelper do
  describe 'user display helper' do
    describe '#display_user' do
      let(:user) { build(:user) }
      subject { helper.display_user(user) }

      it 'displays the user\'s name' do
        expect(subject).to eq(user.name)
      end
    end

    describe '#link_to_user' do
      let(:user) { build(:user) }
      subject { helper.link_to_user(user) }

      it { is_expected.to have_tag('a') }

      context 'when no block is given' do
        it { is_expected.to include(helper.display_user(user)) }
      end

      context 'when a block is given' do
        subject do
          helper.link_to_user(user) do
            'Test'
          end
        end

        it { is_expected.to include('Test') }
      end
    end
  end

  describe 'time-bounded helper' do
    let(:stub) do
      Object.new.tap do |result|
        start_at = self.start_at
        end_at = self.end_at
        result.define_singleton_method(:started?) { Time.zone.now >= start_at }
        result.define_singleton_method(:currently_active?) do
          Time.zone.now >= start_at && Time.zone.now <= end_at
        end
        result.define_singleton_method(:ended?) { Time.zone.now > end_at }
      end
    end

    describe '#time_period_class' do
      subject { helper.time_period_class(stub) }

      context 'when the object is not started' do
        let(:start_at) { Time.zone.now + 1.day }
        let(:end_at) { Time.zone.now + 2.days }
        it { is_expected.to eq(['not-started']) }
      end

      context 'when the object is currently active' do
        let(:start_at) { Time.zone.now - 1.day }
        let(:end_at) { Time.zone.now + 1.day }
        it { is_expected.to eq(['currently-active']) }
      end

      context 'when the object is ended' do
        let(:start_at) { Time.zone.now - 1.week }
        let(:end_at) { Time.zone.now - 1.day }
        it { is_expected.to eq(['ended']) }
      end
    end

    describe '#time_period_message' do
      subject { helper.time_period_message(stub) }

      context 'when the object is not started' do
        let(:start_at) { Time.zone.now + 1.day }
        let(:end_at) { Time.zone.now + 2.days }
        it { is_expected.to eq(I18n.t('common.not_started')) }
      end

      context 'when the object is currently active' do
        let(:start_at) { Time.zone.now - 1.day }
        let(:end_at) { Time.zone.now + 1.day }
        it { is_expected.to be_nil }
      end

      context 'when the object is ended' do
        let(:start_at) { Time.zone.now - 1.week }
        let(:end_at) { Time.zone.now - 1.day }
        it { is_expected.to eq(I18n.t('common.ended')) }
      end
    end
  end

  describe 'draft helper' do
    let(:stub) do
      Object.new.tap do |result|
        draft = self.draft
        result.define_singleton_method(:draft?) { draft }
      end
    end

    describe '#draft_class' do
      subject { helper.draft_class(stub) }
      context 'when the object is a draft' do
        let(:draft) { true }
        it { is_expected.to eq(['draft']) }
      end

      context 'when the object is not a draft' do
        let(:draft) { false }
        it { is_expected.to eq([]) }
      end
    end

    describe '#draft_message' do
      subject { helper.draft_message(stub) }
      context 'when the object is a draft' do
        let(:draft) { true }
        it { is_expected.to eq(I18n.t('common.draft')) }
      end

      context 'when the object is not a draft' do
        let(:draft) { false }
        it { is_expected.to be_nil }
      end
    end
  end
end
