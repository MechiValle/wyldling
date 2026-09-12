import { useState } from 'react';
import { InstructionStep } from '../components/InstructionStep';

const TUNA_PRICE = 20;
const FLOUR_PRICE = 15;
const SELL_PRICE = 100;
const COST_PER_SET = TUNA_PRICE + FLOUR_PRICE;

export function Cheats() {
  const [budget, setBudget] = useState('');

  const budgetNumber = Number(budget) || 0;
  const units = Math.floor(budgetNumber / COST_PER_SET);
  const totalCost = units * COST_PER_SET;
  const leftover = budgetNumber - totalCost;
  const revenue = units * SELL_PRICE;
  const profit = revenue - totalCost;

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-display text-3xl font-bold mb-4 text-center">Cheats</h1>

      
      <div className='max-w-sm mx-auto border-2 border-marigold-harvest rounded-xl p-4 mb-8'>
        <label className='block text-sm font-semibold mb-1'>
          How much money do you want to spend?
        </label>
        <input
          type='number'
          min='0'
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder='e.g. 500'
          className='w-full border-2 border-sage-meadow rounded-lg px-3 py-2 bg-transparent font-body mb-4'
        />

        {budgetNumber > 0 && (
          <div className='flex flex-col gap-2 text-sm'>
            <p>
              <span className='font-semibold'>Tuna to buy:</span> {units}
            </p>
            <p>
              <span className='font-semibold'>Flour to buy:</span> {units}
            </p>
            <p>
              <span className='font-semibold'>Total spent:</span> {totalCost}{' '}
              gold
            </p>
            {leftover > 0 && (
              <p>
                <span className='font-semibold'>
                  Leftover (not enough for one more set):
                </span>{' '}
                {leftover} gold
              </p>
            )}
            <div className='mt-2 pt-2 border-t border-sage-meadow/30'>
              <p>
                <span className='font-semibold'>Sell to Sophia for:</span>{' '}
                {revenue} gold
              </p>
              <p>
                <span className='font-semibold'>Profit:</span> {profit} gold
              </p>
            </div>
          </div>
        )}
      </div>

      <h2 className='font-display text-xl font-semibold mb-3'>
        The Fish Fingers trick
      </h2>
      <p className='text-sm mb-6 max-w-xl'>
        This is a small cheat to make money fast. Here's how it works.
      </p>
      <div className='flex flex-col gap-3 max-w-xl'>
        <InstructionStep
          number={1}
          title='Buy Tuna from Bruno'
          description='Tuna costs 20 gold each.'
        />
        <InstructionStep
          number={2}
          title='Buy Flour from Lina'
          description='Flour costs 15 gold each.'
        />
        <InstructionStep
          number={3}
          title='Cook Fish Fingers at home'
          description='Uses equal amounts of tuna and flour.'
        />
        <InstructionStep
          number={4}
          title='Sell your Fish Fingers to Sophia'
          description='Sophia buys them for 100 gold each, a solid profit per batch!'
        />
        <InstructionStep
          number={5}
          title='Best day to do this: Tuesday and Wednesday'
          description="Bruno, Lina, and Sophia's shops are all open on Tuesdays and Wednesdays, so you can complete the entire loop in a single day."
        />
      </div>
    </div>
  );
}
