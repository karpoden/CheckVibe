from aiogram import Bot, Dispatcher, executor, types

API_TOKEN = 'YOUR_BOT7462949398:AAEFZ35aAVzh2TZR6ijn7C_k82ruwAkiBJ8_TOKEN_HERE'

bot = Bot(token=API_TOKEN)
dp = Dispatcher(bot)

@dp.message_handler(commands=['start'])
async def cmd_start(message: types.Message):
    user_id = message.from_user.id
    
    keyboard = types.ReplyKeyboardMarkup(resize_keyboard=True)
    # Кнопка с web_app, передаём user_id в init_data (в json или как параметр)
    keyboard.add(types.KeyboardButton(
        text="Открыть Mini App",
        web_app=types.WebAppInfo(url=f"https://checkvibe.ru?user_id={user_id}")
    ))
    
    await message.answer("Привет! Нажми на кнопку, чтобы открыть мини-приложение.", reply_markup=keyboard)

if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)
