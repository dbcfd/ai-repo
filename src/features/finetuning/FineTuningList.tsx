import React, { useState } from 'react'
import { Box, Heading, Container, VStack, Stack, Input, HStack, Button, Spacer, Link as ChakraLink } from '@chakra-ui/react'
import { nanoid } from 'nanoid'
import {useAuth, useCollection, useDocument, usePolybase} from '@polybase/react'
import { Collection, FineTuning } from "@/features/types";
import {useParams} from "next/navigation";

export function ProfileDetail() {
    const [msg, setMsg] = useState('')
    const { account } = useParams()
    const polybase = usePolybase()

    const { auth } = useAuth()

    const { data: finetunings } = useCollection<FineTuning>(
        account ? polybase.collection(Collection.FineTuning)
            .where('owner', '==', account)
            .sort('version.major', 'desc')
            : null,
    )

    const share = useAsyncCallback(async (e) => {
        e.preventDefault()
        const pk = auth?.wallet?.getPublicKeyString()
        if (!pk || !account) throw new Error('You must be logged in to share a message')
        await polybase.collection<Message>('demo/social/messages').create([
            nanoid(),
            account,
            msg,
            moment().toISOString(),
        ])
        setMsg('')
    })

    return (
        <Layout>
            <VStack>
                <Container maxW='xl' p={4}>
                    <Stack spacing={8}>
                        <Box>
                            <Stack>
                                <HStack>
                                    <Heading>
                                        {data?.data?.name ?? 'Annon'}{auth?.account === account ? ' (You)' : ''}
                                    </Heading>
                                    <Spacer />
                                    {auth?.account === account && (
                                        <Button size={'xs'}>
                                            <Link to='/profiles/edit'>Edit profile</Link>
                                        </Button>
                                    )}
                                </HStack>
                                <Heading size='sm' color='bw.600' fontWeight='normal'>
                                    <ChakraLink isExternal href={`https://explorer.testnet.polybase.xyz/collections/demo%2Fsocial%2Fusers/${data?.data?.id}`}>{data?.data?.id} ↗️</ChakraLink>
                                </Heading>
                            </Stack>
                        </Box>

                        <Box>
                            <Stack spacing={3}>
                                <Heading size={'md'}>Messages</Heading>
                                {auth?.account === account && (
                                    <form onSubmit={share.execute}>
                                        <HStack>
                                            <Input value={msg} placeholder='Write something...' onChange={(e) => setMsg(e.target.value)} />
                                            <Button type='submit' isLoading={share.loading} onClick={share.execute}>Share</Button>
                                        </HStack>
                                    </form>
                                )}
                                <Stack>
                                    {messagesEl}
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>
                </Container>
            </VStack>
        </Layout>
    )
}