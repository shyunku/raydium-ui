import { Connection } from '@solana/web3.js'
import { Plugin } from '@nuxt/types'

import { web3Config, commitment, createWeb3Instance } from '@/utils/web3'
import logger from '@/utils/logger'
import { NuxtApiInstance, Rpc } from '@/types/api'

async function getFastEndpoint(api: NuxtApiInstance, endpoints: Rpc[]) {
  return await Promise.any(endpoints.map((endpoint) => api.getEpochInfo(endpoint.url).then(() => endpoint.url)))
}

export function getWeightEndpoint(endpoints: Rpc[]) {
  let pointer = 0
  const random = Math.random() * 100
  let api = endpoints[0].url

  for (const endpoint of endpoints) {
    if (random > pointer + endpoint.weight) {
      pointer += pointer + endpoint.weight
    } else if (random >= pointer && random < pointer + endpoint.weight) {
      api = endpoint.url
      break
    } else {
      api = endpoint.url
      break
    }
  }

  return api
}

const web3Plugin: Plugin = async (ctx, inject) => {
  const { $api, $config } = ctx
  const solanaRpcHost = $config.solanaRpcHost as string
  web3Config.rpcs = [
    { url: solanaRpcHost, weight: 100 } // 로컬 체인 주소 주입
  ]

  let config = web3Config // 이제 config는 항상 우리가 주입한 web3Config를 사용합니다.
  let configFrom = 'local_injected' // 출력을 위한 플래그

  const { rpcs, strategy } = config

  let endpoint
  if (strategy === 'weight') {
    endpoint = getWeightEndpoint(rpcs)
  } else {
    // getFastEndpoint는 Promise.any를 사용하므로, rpcs 배열에 하나의 유효한 URL만 있어도 작동합니다.
    endpoint = await getFastEndpoint($api, rpcs)
  }

  logger(`config from: ${configFrom}, strategy: ${strategy}, using ${endpoint}`)

  const web3 = createWeb3Instance(endpoint, commitment) // createWeb3Instance 사용

  ctx.$web3 = web3
  inject('web3', web3)
}

export default web3Plugin
