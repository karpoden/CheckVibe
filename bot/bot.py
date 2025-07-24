from aiogram import Bot, Dispatcher, executor, types

API_TOKEN = '7462949398:AAEFZ35aAVzh2TZR6ijn7C_k82ruwAkiBJ8'

bot = Bot(token=API_TOKEN)
dp = Dispatcher(bot)

@dp.message_handler(commands=['start'])
async def cmd_start(message: types.Message):
    keyboard = types.InlineKeyboardMarkup()
    keyboard.add(
        types.InlineKeyboardButton(
            text="Открыть CheckVibe",
            web_app=types.WebAppInfo(url="https://checkvibeapp.ru")
        )
    )
    await message.answer("Нажми кнопку ниже, чтобы открыть приложение 👇", reply_markup=keyboard)

if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)
