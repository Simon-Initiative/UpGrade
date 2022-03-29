import { HttpClient } from "@angular/common/http";
import { of } from "rxjs/internal/observable/of";
import { environment } from "../../../environments/environment";
import { FeatureFlagsDataService } from "./feature-flags.data.service";
import { FeatureFlag, FeatureFlagsPaginationParams } from "./store/feature-flags.model";

class MockHTTPClient {
    get = jest.fn().mockReturnValue(of());
    post = jest.fn().mockReturnValue(of());
    delete = jest.fn().mockReturnValue(of());
    put = jest.fn().mockReturnValue(of());
}

describe('FeatureFlagsDataService', () => {
    let mockHttpClient: any; 
    let service: FeatureFlagsDataService;
    let mockFlagId: string;
    let mockParams: FeatureFlagsPaginationParams;
    let mockFlag: FeatureFlag;
    let mockStatus: boolean;

    beforeEach(() => {
        mockHttpClient = new MockHTTPClient();
        service = new FeatureFlagsDataService(mockHttpClient as HttpClient);
        mockParams = {
            skip: 0,
            take: 10
        };
        mockFlagId = 'abc123';
        mockStatus = true;
        mockFlag = {
            createdAt: 'abc123',
            updatedAt: 'abc123',
            versionNumber: 5,
            id: 'abc123',
            name: 'abc123',
            key: 'abc123',
            description: 'abc123',
            variationType: 'abc123',
            status: true,
            variations: []
          }
    });

    describe('#fetchFeatureFlags', () => {
        it('should get the fetchFeatureFlags http observable', () => {
            const expectedUrl = environment.api.getPaginatedFlags;
            const params = { ...mockParams };

            service.fetchFeatureFlags(params);

            expect(mockHttpClient.post).toHaveBeenCalledWith(expectedUrl, params);
        })
    })

    describe('#createNewFeatureFlag', () => {
        it('should get the createNewFeatureFlag http observable', () => {
            const expectedUrl = environment.api.featureFlag;
            const flag = mockFlag;

            service.createNewFeatureFlag(flag);

            expect(mockHttpClient.post).toHaveBeenCalledWith(expectedUrl, flag);
        })
    })

    describe('#updateFlagStatus', () => {
        it('should get the updateFlagStatus http observable', () => {
            const expectedUrl = environment.api.updateFlagStatus;
            const flagId = mockFlagId;
            const status = mockStatus;

            service.updateFlagStatus(flagId, status);

            expect(mockHttpClient.post).toHaveBeenCalledWith(expectedUrl, { flagId, status });
        })
    })

    describe('#deleteFeatureFlag', () => {
        it('should get the deleteFeatureFlag http observable', () => {
            const id = mockFlagId;
            const expectedUrl = `${environment.api.featureFlag}/${id}`;

            service.deleteFeatureFlag(id);

            expect(mockHttpClient.delete).toHaveBeenCalledWith(expectedUrl);
        })
    })

    describe('#updateFeatureFlag', () => {
        it('should get the updateFeatureFlag http observable', () => {
            const flag = { ...mockFlag };
            const mockUrl = `${environment.api.featureFlag}/${flag.id}`;

            service.updateFeatureFlag(flag);

            expect(mockHttpClient.put).toHaveBeenCalledWith(mockUrl, flag);
        })
    })
})