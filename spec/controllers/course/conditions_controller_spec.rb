require 'rails_helper'

RSpec.describe Course::ConditionsController, type: :controller do
  controller(Course::ConditionsController) do
  end

  describe '#return_to_path' do
    it { expect { controller.return_to_path }.to raise_error(NotImplementedError) }
  end

  describe '#set_conditional' do
    it { expect { controller.set_conditional }.to raise_error(NotImplementedError) }
  end
end
