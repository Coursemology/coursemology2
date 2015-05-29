Rails.application.routes.draw do
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
  concern :paginatable do
    get '(page/:page)', action: :index, on: :collection, as: ''
  end

  devise_for :users
  get 'users/emails' => 'users#emails', as: :user_emails
  patch 'users/emails' => 'users#update_emails', as: :update_user_emails

  namespace :admin do
    get '/' => 'admin#index'
    resources :system_announcements, concerns: :paginatable
    resources :announcements, concerns: :paginatable
    resources :instances

    get 'components' => 'admin#components'
    patch 'components' => 'admin#update_components'
  end

  scope module: 'course' do
    resources :courses do
      resources :announcements, concerns: :paginatable
      resources :achievements
      get 'settings' => 'settings#index', as: :settings
      patch 'settings' => 'settings#update', as: :update_settings

      resources :users, except: [:new, :edit]
    end
  end
end
