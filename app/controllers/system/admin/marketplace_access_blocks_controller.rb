# frozen_string_literal: true
class System::Admin::MarketplaceAccessBlocksController < System::Admin::Controller
  def create
    block = Course::Assessment::Marketplace::AccessBlock.new(
      user_id: params[:user_id], creator: current_user
    )
    if block.save
      render json: { id: block.id, userId: block.user_id }, status: :ok
    else
      render json: { errors: block.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def destroy
    block = Course::Assessment::Marketplace::AccessBlock.find(params[:id])
    if block.destroy
      head :ok
    else
      render json: { errors: block.errors.full_messages.to_sentence }, status: :bad_request
    end
  end
end
