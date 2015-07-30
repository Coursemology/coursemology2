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
        valid_from = self.valid_from
        valid_to = self.valid_to
        result.define_singleton_method(:not_yet_valid?) { Time.zone.now < valid_from }
        result.define_singleton_method(:currently_valid?) do
          Time.zone.now >= valid_from && Time.zone.now <= valid_to
        end
        result.define_singleton_method(:expired?) { Time.zone.now > valid_to }
      end
    end

    describe '#time_period_class' do
      subject { helper.time_period_class(stub) }

      context 'when the object is not yet valid' do
        let(:valid_from) { Time.zone.now + 1.day }
        let(:valid_to) { Time.zone.now + 2.days }
        it { is_expected.to eq(['not-yet-valid']) }
      end

      context 'when the object is currently valid' do
        let(:valid_from) { Time.zone.now - 1.day }
        let(:valid_to) { Time.zone.now + 1.day }
        it { is_expected.to eq(['currently-valid']) }
      end

      context 'when the object is expired' do
        let(:valid_from) { Time.zone.now - 1.week }
        let(:valid_to) { Time.zone.now - 1.day }
        it { is_expected.to eq(['expired']) }
      end
    end

    describe '#time_period_message' do
      subject { helper.time_period_message(stub) }

      context 'when the object is yet valid' do
        let(:valid_from) { Time.zone.now + 1.day }
        let(:valid_to) { Time.zone.now + 2.days }
        it { is_expected.to eq(I18n.t('common.not_yet_valid')) }
      end

      context 'when the object is currently valid' do
        let(:valid_from) { Time.zone.now - 1.day }
        let(:valid_to) { Time.zone.now + 1.day }
        it { is_expected.to be_nil }
      end

      context 'when the object is expired' do
        let(:valid_from) { Time.zone.now - 1.week }
        let(:valid_to) { Time.zone.now - 1.day }
        it { is_expected.to eq(I18n.t('common.expired')) }
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
