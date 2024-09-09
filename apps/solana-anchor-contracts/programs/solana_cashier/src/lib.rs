use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer, TokenAccount, Token};

declare_id!("CizWDMr17EATDas9gerTNCT7Z1t95zRxVtPDDmTtFEvb");

#[program]
pub mod solana_cashier {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, treasury: Pubkey) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.owner = *ctx.accounts.owner.key;
        state.treasury = treasury;
        Ok(())
    }

    pub fn transfer_ownership(ctx: Context<TransferOwnership>, new_owner: Pubkey) -> Result<()> {
        let state = &mut ctx.accounts.state;
        require!(state.owner == *ctx.accounts.current_owner.key, ErrorCode::Unauthorized);
        state.owner = new_owner;
        Ok(())
    }

    pub fn set_treasury(ctx: Context<SetTreasury>, new_treasury: Pubkey) -> Result<()> {
        let state = &mut ctx.accounts.state;
        require!(state.owner == *ctx.accounts.owner.key, ErrorCode::Unauthorized);
        state.treasury = new_treasury;
        Ok(())
    }

    pub fn add_token(ctx: Context<UpdateToken>, token: Pubkey) -> Result<()> {
        let state = &mut ctx.accounts.state;
        require!(state.owner == *ctx.accounts.owner.key, ErrorCode::Unauthorized);
        state.in_tokens.push(token);
        Ok(())
    }

    pub fn remove_token(ctx: Context<UpdateToken>, token: Pubkey) -> Result<()> {
        let state = &mut ctx.accounts.state;
        require!(state.owner == *ctx.accounts.owner.key, ErrorCode::Unauthorized);
        state.in_tokens.retain(|&x| x != token);
        Ok(())
    }

    pub fn set_out_token(ctx: Context<SetOutToken>, token: Pubkey) -> Result<()> {
        let state = &mut ctx.accounts.state;
        require!(state.owner == *ctx.accounts.owner.key, ErrorCode::Unauthorized);
        state.out_token = token;
        Ok(())
    }

    pub fn deposit_and_swap(ctx: Context<DepositAndSwap>, amount: u64) -> Result<()> {
        let state = &ctx.accounts.state;
        let user_token = ctx.accounts.user_token_account.mint;

        require!(state.in_tokens.contains(&user_token), ErrorCode::TokenNotAllowed);

        // Transfer the tokens from the user to the treasury account
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
            authority: ctx.accounts.user_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program.clone(), cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        emit!(DepositEvent {
            user: ctx.accounts.user_authority.key(),
            amount: amount,
            token: state.out_token,
        });

        Ok(())
    }
}

#[account]
pub struct State {
    pub owner: Pubkey,
    pub treasury: Pubkey,
    pub in_tokens: Vec<Pubkey>,
    pub out_token: Pubkey,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = owner, space = 8 + 32 + 32 + (32 * 10) + 32)]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct TransferOwnership<'info> {
    #[account(mut)]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub current_owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetTreasury<'info> {
    #[account(mut)]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateToken<'info> {
    #[account(mut)]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetOutToken<'info> {
    #[account(mut)]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
pub struct DepositAndSwap<'info> {
    #[account(mut)]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut, address = state.treasury)] // Ensure the account matches the `treasury` in the state
    pub treasury: Account<'info, TokenAccount>,  // The treasury account passed directly
    #[account(mut)]
    pub user_authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[event]
pub struct DepositEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub token: Pubkey,
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
    #[msg("This token is not allowed.")]
    TokenNotAllowed,
}
