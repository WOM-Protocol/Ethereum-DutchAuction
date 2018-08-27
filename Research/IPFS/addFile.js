const IPFS = require('ipfs');
const node = new IPFS();

node.on('ready', async () => {
  const version = await node.version()

  console.log('Version:', version.version)

  const filesAdded = await node.files.add({
    path: 'testFile.txt',
    content: Buffer.from('This is a testfile.')
  })

  console.log('Added file:', filesAdded[0].path, filesAdded[0].hash)

  const fileBuffer = await node.files.cat(filesAdded[0].hash)

  console.log('Added file contents:', fileBuffer.toString())
})
