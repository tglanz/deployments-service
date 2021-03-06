import { assert } from 'chai';
import { createServer, ServerInfo } from '../../../server';

describe('api/v1/status route', () => {
    it('should return valid response', async () => {
        // Arrange

        const serverInfo: ServerInfo = {
            hostname: 'localhost',
            port: 3000,
            exposeDocs: false,
            verbose: false,
            repositoryType: "memory",
            repositoryInfo: null
        }

        const server = await createServer(serverInfo);

        // Act
        const response = await server.inject({
            method: 'GET',
            url: '/api/v1/status'
        });

        // Assert
        assert.equal(response.statusCode, 200);

        const body = response.json();
        assert.hasAllKeys(body, ['message', 'creationTime']);
    })
})
