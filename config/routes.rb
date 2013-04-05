Terminal::Application.routes.draw do
  
  resources :prompts, :only => [:index, :create]
  
  root :to => 'prompts#index'
  
end
