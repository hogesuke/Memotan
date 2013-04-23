# coding: utf-8

class SessionsController < ApplicationController

  def callback
 
    #omniauth.auth環境変数を取得
    auth = request.env["omniauth.auth"]
 
    #Userモデルを検索
    user = User.find_by_provider_and_uid(auth["provider"], auth["uid"])
 
    if user
       # 既存のユーザ情報があった場合、ルートに遷移させる
       session[:usr] = user.id
       session[:provider] = user.provider
       session[:name] = user.name
       redirect_to root_url
    else
       # Userモデルに:providerと:uidが無い場合（外部認証していない）、保存してからルートへ遷移させる
       User.create_with_omniauth(auth)
       session[:usr] = auth["uid"]
       session[:provider] = auth["provider"]
       session[:name] = auth["info"]["name"]
       redirect_to root_url
    end
 
  end
end
