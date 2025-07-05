import { Connection } from '@solana/web3.js'
import { Plugin } from '@nuxt/types'

import { web3Config, commitment, setSolanaRpcUrl, getConnection } from '@/utils/web3'
import logger from '@/utils/logger'
import { NuxtApiInstance, Rpc } from '@/types/api'

const web3Plugin: Plugin = async (ctx, inject) => {
  const { $api, $config } = ctx
  const solanaRpcHost = $config.solanaRpcHost

  if (solanaRpcHost) {
    setSolanaRpcUrl(solanaRpcHost) // src/utils/web3.ts에 RPC URL 설정
  }

  const web3 = getConnection()
  ctx.$web3 = web3
  inject('web3', web3)
}

export default web3Plugin
