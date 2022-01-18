import { FastifyInstance } from 'fastify';
import { Deployment } from '../../../model';
import { PaginationCriteria } from '../../../services/pagination';
import { BadRequestReply, NoContentReply } from '../../../services/generic-payloads';

const Schema = {
    Deployment: {
        $id: "model/deployment",
        type: "object",
        required: [],
        properties: {
            imageId: { type: 'string' },
        },
    },
    DeploymentArray: {
        $id: "model/deployment-array",
        type: "array",
        items: {
            $ref: "model/deployment"
        }
    }
}

interface CreateDeploymentBody {
    imageId: string
}

interface DeploymentCountReply {
    count: number
}

export default async function (
    server: FastifyInstance,
) {
    server.addSchema(Schema.Deployment);
    server.addSchema(Schema.DeploymentArray);

    server.put<{
        Body: CreateDeploymentBody;
        Reply: NoContentReply | BadRequestReply
    }>('/deployment', {
        schema: {
            body: {
                $ref: 'model/deployment'
            },
            response: {
                204: {
                    
                },
                400: {
                    $ref: "bad-request"
                }
            }
        }
    }, async function (request, response) {
        const {imageId} = request.body;
        const image = await this.repository.getImageById(imageId);
        if (image) {
            await this.repository.createDeployment(request.body);
            response.status(204);
        } else {
            response.status(400);
            response.send({
                message: `No such image with id "${imageId}"`
            })
        }
    });

    server.get<{
        Reply: Deployment[],
        Querystring: PaginationCriteria
    }>('/deployment', {
        schema: {
            querystring: {
                $ref: "pagination"
            },
            response: {
                200: {
                    $ref: "model/deployment-array"
                }
            }
        }
    }, async function (request, response) {
        const { offset, limit } = request.query;
        const deployments = await this.repository.getAllDeployments(offset, limit);
        response.send(deployments);
    })

    // Usually I don't believe returning a primitive is good since we cannot
    // enhance the response later on without breaking clients.
    // So, we will wrap the primitive in an object with a single field "count"
    server.get<{ Reply: DeploymentCountReply }>('/deployment/count', {
        schema: {
            response: {
                200: {
                    type: "object",
                    properties: {
                        count: {type: "number"}
                    }
                }
            }
        }
    }, async function (_request, response) {
        const count = await this.repository.countDeployments();
        response.send({ count });
    })
}