# frozen_string_literal: true
class Test::FactoriesController < Test::Controller
  before_action :set_user_stamper, only: [:create]

  def create
    models = {}

    ActsAsTenant.with_tenant(Instance.default) do
      create_params.each do |factory_name, attributes|
        traits = traits_from(attributes)
        model = FactoryBot.create(factory_name, *traits, attributes)
        models[factory_name] = model.as_json
      rescue SystemStackError
        models[factory_name] = { id: model.id }
      end
    end

    result = (models.size <= 1) ? models.values.first : models
    render json: result, status: :created
  end

  private

  def create_params
    params.permit(factory: {}).to_h['factory']
  end

  def set_user_stamper
    User.stamper = User.human_users.first
  end

  def traits_from(attributes)
    attributes.extract!('traits')[:traits]&.map(&:to_sym)
  end
end
